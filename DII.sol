// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*//////////////////////////////////////////////////////////////
                        INTERFACES
//////////////////////////////////////////////////////////////*/

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/*//////////////////////////////////////////////////////////////
                        LIBRARY: SafeERC20
//////////////////////////////////////////////////////////////*/

library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        require(_callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value)));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        require(_callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value)));
    }

    function safeApprove(IERC20 token, address spender, uint256 value) internal {
        require(_callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value)));
    }

    function _callOptionalReturn(IERC20 token, bytes memory data) private returns (bool) {
        (bool success, bytes memory returndata) = address(token).call(data);
        if (!success) return false;
        if (returndata.length == 0) return true;
        return abi.decode(returndata, (bool));
    }
}

/*//////////////////////////////////////////////////////////////
                        ABSTRACTS: Context, Ownable2Step
//////////////////////////////////////////////////////////////*/

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable2Step is Context {
    address private _owner;
    address private _pendingOwner;
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: not owner");
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: zero address");
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(_owner, newOwner);
    }

    function acceptOwnership() public virtual {
        require(_msgSender() == _pendingOwner, "Ownable: not pending");
        _transferOwnership(_pendingOwner);
        _pendingOwner = address(0);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/*//////////////////////////////////////////////////////////////
                        ABSTRACTS: ReentrancyGuard, Pausable
//////////////////////////////////////////////////////////////*/

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;

    modifier nonReentrant() {
        require(_status == _NOT_ENTERED, "Reentrancy");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

abstract contract Pausable is Context {
    event Paused(address account);
    event Unpaused(address account);
    bool private _paused;

    modifier whenNotPaused() {
        require(!_paused, "Paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "Not paused");
        _;
    }

    function paused() public view virtual returns (bool) {
        return _paused;
    }

    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

/*//////////////////////////////////////////////////////////////
                        CONTRACT: SafeRouterV2
//////////////////////////////////////////////////////////////*/

contract SafeRouterV2 is Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    address public feeRecipient;
    uint256 public feeBps;
    uint256 public constant MAX_FEE_BPS = 100;
    uint256 public minTradeAmount;
    uint256 public collectedETHFees;

    mapping(address => uint256) public collectedTokenFees;
    mapping(address => bool) public approvedRouters;
    mapping(bytes32 => uint256) public adminQueuedAt;

    uint256 private constant ADMIN_DELAY = 1 hours;

    event AdminActionQueued(bytes32 indexed id, uint256 timestamp);
    event AdminActionCancelled(bytes32 indexed id);
    event AdminActionExecuted(bytes32 indexed id);
    event RouterSet(address indexed router, bool allowed);
    event FeeParamsUpdated(uint256 feeBps, address feeRecipient);
    event MinTradeUpdated(uint256 minTradeAmount);
    event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, address router);
    event TokenFeesWithdrawn(address indexed token, uint256 amount, address indexed recipient);
    event ETHFeesWithdrawn(uint256 amount, address indexed recipient);
    event EmergencyTokenRescue(address indexed token, uint256 amount, address indexed to);
    event EmergencyETHRescue(uint256 amount, address indexed to);

    constructor(address _feeRecipient, uint256 _feeBps, uint256 _minTradeAmount) {
        require(_feeRecipient != address(0), "zero recipient");
        require(_feeBps <= MAX_FEE_BPS, "fee too high");
        feeRecipient = _feeRecipient;
        feeBps = _feeBps;
        minTradeAmount = _minTradeAmount;
    }

    modifier onlyAfterDelay(bytes32 id) {
        uint256 queued = adminQueuedAt[id];
        require(queued != 0, "not queued");
        require(block.timestamp >= queued + ADMIN_DELAY, "delay not passed");
        _;
        adminQueuedAt[id] = 0;
        emit AdminActionExecuted(id);
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN ACTIONS (QUEUE)
    //////////////////////////////////////////////////////////////*/

    function queueAdminAction(bytes32 id) external onlyOwner {
        require(adminQueuedAt[id] == 0, "already queued");
        adminQueuedAt[id] = block.timestamp;
        emit AdminActionQueued(id, block.timestamp);
    }

    function cancelAdminAction(bytes32 id) external onlyOwner {
        require(adminQueuedAt[id] != 0, "not queued");
        adminQueuedAt[id] = 0;
        emit AdminActionCancelled(id);
    }

    /*//////////////////////////////////////////////////////////////
                        CONFIGURATION
    //////////////////////////////////////////////////////////////*/

    function setRouter(address router, bool allowed) external onlyOwner onlyAfterDelay(keccak256(abi.encodePacked("ROUTER", router))) {
        require(router != address(0), "zero router");
        approvedRouters[router] = allowed;
        emit RouterSet(router, allowed);
    }

    function setFeeParams(uint256 _feeBps, address _feeRecipient) external onlyOwner onlyAfterDelay(keccak256(abi.encodePacked("FEE", _feeBps, _feeRecipient))) {
        require(_feeBps <= MAX_FEE_BPS, "fee too high");
        require(_feeRecipient != address(0), "zero recipient");
        feeBps = _feeBps;
        feeRecipient = _feeRecipient;
        emit FeeParamsUpdated(_feeBps, _feeRecipient);
    }

    function setMinTradeAmount(uint256 _amt) external onlyOwner onlyAfterDelay(keccak256(abi.encodePacked("MIN_TRADE", _amt))) {
        minTradeAmount = _amt;
        emit MinTradeUpdated(_amt);
    }

    function pauseContract() external onlyOwner onlyAfterDelay(keccak256("PAUSE")) {
        _pause();
    }

    function unpauseContract() external onlyOwner onlyAfterDelay(keccak256("UNPAUSE")) {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                        CORE LOGIC: SWAP
    //////////////////////////////////////////////////////////////*/

    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minOut,
        uint256 deadline,
        address router,
        bytes calldata data
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        require(block.timestamp <= deadline, "expired");
        require(approvedRouters[router], "router not approved");
        require(amountIn >= minTradeAmount, "below min");
        require(tokenIn != address(0) && tokenOut != address(0), "zero token");

        IERC20 inToken = IERC20(tokenIn);
        IERC20 outToken = IERC20(tokenOut);

        uint256 fee = (amountIn * feeBps) / 10000;
        uint256 sendAmount = amountIn - fee;

        inToken.safeTransferFrom(msg.sender, address(this), amountIn);
        if (fee > 0) collectedTokenFees[tokenIn] += fee;

        inToken.safeApprove(router, 0);
        if (sendAmount > 0) inToken.safeApprove(router, sendAmount);

        uint256 beforeBal = outToken.balanceOf(address(this));
        (bool ok, bytes memory ret) = router.call{gas: gasleft()}(data);
        require(ok, _getRevertMsg(ret));

        inToken.safeApprove(router, 0);
        uint256 afterBal = outToken.balanceOf(address(this));
        require(afterBal >= beforeBal, "invalid balance");

        amountOut = afterBal - beforeBal;
        require(amountOut >= minOut, "slippage");

        outToken.safeTransfer(msg.sender, amountOut);
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut, router);
    }

    /*//////////////////////////////////////////////////////////////
                        WITHDRAW & RESCUE
    //////////////////////////////////////////////////////////////*/

    function withdrawTokenFees(address token, uint256 amt) external onlyOwner {
        uint256 bal = collectedTokenFees[token];
        require(amt <= bal, "insufficient");
        collectedTokenFees[token] = bal - amt;
        IERC20(token).safeTransfer(feeRecipient, amt);
        emit TokenFeesWithdrawn(token, amt, feeRecipient);
    }

    function withdrawETHFees(uint256 amt) external onlyOwner {
        require(amt <= collectedETHFees, "insufficient");
        collectedETHFees -= amt;
        (bool sent,) = payable(feeRecipient).call{value: amt}("");
        require(sent, "eth fail");
        emit ETHFeesWithdrawn(amt, feeRecipient);
    }

    function rescueERC20(address token, uint256 amt, address to) external onlyOwner whenPaused onlyAfterDelay(keccak256(abi.encodePacked("RESCUE", token, amt, to))) {
        IERC20(token).safeTransfer(to, amt);
        emit EmergencyTokenRescue(token, amt, to);
    }

    function rescueETH(uint256 amt, address to) external onlyOwner whenPaused onlyAfterDelay(keccak256(abi.encodePacked("RESCUE_ETH", amt, to))) {
        (bool ok,) = payable(to).call{value: amt}("");
        require(ok, "eth send failed");
        emit EmergencyETHRescue(amt, to);
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL HELPERS
    //////////////////////////////////////////////////////////////*/

    function _getRevertMsg(bytes memory returnData) internal pure returns (string memory) {
        if (returnData.length < 68) return "router call failed";
        assembly {
            returnData := add(returnData, 0x04)
        }
        return abi.decode(returnData, (string));
    }

    receive() external payable {
        collectedETHFees += msg.value;
    }
}
