// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
}

contract SafeRouter {
    address public immutable feeRecipient;
    address public owner;
    address public pendingOwner;
    uint256 public feeBps;
    uint256 public constant MAX_FEE_BPS = 100;
    uint256 public minTradeAmount = 1000;
    bool public paused;
    mapping(address => bool) public approvedRouters;
    mapping(address => uint256) public collectedTokenFees;
    uint256 public collectedETHFees;
    mapping(bytes32 => uint256) public adminActionTimestamps;
    uint256 private _status;
    uint256 public constant ADMIN_DELAY = 1 hours;

    event OwnerChangeInitiated(address indexed oldOwner, address indexed newOwner);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event RouterSet(address indexed router, bool approved);
    event FeeBpsSet(uint256 oldFee, uint256 newFee);
    event Paused(bool state);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier nonReentrant() {
        require(_status == 0, "Reentrancy");
        _status = 1;
        _;
        _status = 0;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier onlyAfterDelay(bytes32 id) {
        uint256 t = adminActionTimestamps[id];
        require(t != 0 && block.timestamp >= t + ADMIN_DELAY, "Delay not met");
        _;
        delete adminActionTimestamps[id];
    }

    constructor(address r) {
        require(r != address(0), "Zero recipient");
        owner = msg.sender;
        feeRecipient = r;
        feeBps = 30;
    }

    function queueAdminAction(bytes32 id) external onlyOwner {
        adminActionTimestamps[id] = block.timestamp;
    }

    function initiateOwnershipTransfer(address n) external onlyOwner {
        require(n != address(0), "Zero owner");
        pendingOwner = n;
        emit OwnerChangeInitiated(owner, n);
    }

    function acceptOwnership() external {
        address p = pendingOwner;
        require(msg.sender == p, "Not pending");
        emit OwnerChanged(owner, p);
        owner = p;
        pendingOwner = address(0);
    }

    function setRouter(address r, bool a)
        external
        onlyOwner
        onlyAfterDelay(keccak256(abi.encodePacked("ROUTER", r)))
    {
        approvedRouters[r] = a;
        emit RouterSet(r, a);
    }

    function setFeeBps(uint256 f)
        external
        onlyOwner
        onlyAfterDelay(keccak256("FEE"))
    {
        require(f <= MAX_FEE_BPS, "Too high");
        emit FeeBpsSet(feeBps, f);
        feeBps = f;
    }

    function pause()
        external
        onlyOwner
        onlyAfterDelay(keccak256("PAUSE"))
    {
        paused = true;
        emit Paused(true);
    }

    function unpause()
        external
        onlyOwner
        onlyAfterDelay(keccak256("UNPAUSE"))
    {
        paused = false;
        emit Paused(false);
    }

    function swapTokens(
        address tin,
        address tout,
        uint256 ain,
        uint256 minOut,
        uint256 dl,
        address router,
        bytes calldata data
    ) external nonReentrant whenNotPaused returns (uint256 ao) {
        require(block.timestamp <= dl, "Expired");
        require(approvedRouters[router], "Router not approved");
        require(ain >= minTradeAmount, "Low amount");

        IERC20 tokenIn = IERC20(tin);
        IERC20 tokenOut = IERC20(tout);

        require(tokenIn.transferFrom(msg.sender, address(this), ain), "Transfer in fail");
        uint256 fee = (ain * feeBps) / 10000;
        uint256 amt = ain - fee;
        if (fee != 0) collectedTokenFees[tin] += fee;

        require(tokenIn.approve(router, amt), "Approve fail");
        uint256 beforeBal = tokenOut.balanceOf(address(this));
        (bool ok, ) = router.call(data);
        require(ok, "Router fail");
        require(tokenIn.approve(router, 0), "Reset fail");

        uint256 afterBal = tokenOut.balanceOf(address(this));
        ao = afterBal - beforeBal;
        require(ao >= minOut, "Low output");
        require(tokenOut.transfer(msg.sender, ao), "Transfer out fail");
    }

    function withdrawTokenFees(address t, uint256 a) external onlyOwner {
        uint256 b = collectedTokenFees[t];
        require(a <= b, "Exceeds balance");
        unchecked {
            collectedTokenFees[t] = b - a;
        }
        require(IERC20(t).transfer(feeRecipient, a), "Withdraw fail");
    }

    function withdrawETHFees(uint256 a) external onlyOwner {
        require(a <= collectedETHFees, "Exceeds ETH");
        unchecked {
            collectedETHFees -= a;
        }
        (bool s, ) = payable(feeRecipient).call{value: a}("");
        require(s, "ETH fail");
    }

    receive() external payable {
        collectedETHFees += msg.value;
    }
}