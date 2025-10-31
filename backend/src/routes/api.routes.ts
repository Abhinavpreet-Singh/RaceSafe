import { Router, Request, Response } from 'express';
import { blockchainService } from '../services/blockchain.service';
import { mevDetectionService } from '../services/mev-detection.service';
import { gasOracleService } from '../services/gas-oracle.service';
import { databaseService } from '../services/database.service';
import { blockMonitorService } from '../services/block-monitor.service';

const router = Router();

// Health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    const blockNumber = await blockchainService.getBlockNumber();
    const isMonitoring = blockMonitorService.isRunning();

    res.json({
      status: 'healthy',
      blockchain: {
        connected: blockchainService.isHealthy(),
        latestBlock: blockNumber,
      },
      monitoring: {
        active: isMonitoring,
        latestProcessedBlock: blockMonitorService.getLatestBlock(),
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: Date.now(),
    });
  }
});

// Get current block
router.get('/block/current', async (req: Request, res: Response) => {
  try {
    const blockNumber = await blockchainService.getBlockNumber();
    const block = await blockchainService.getBlock(blockNumber);

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json({
      number: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      transactionCount: block.transactions.length,
      gasUsed: block.gasUsed?.toString(),
      gasLimit: block.gasLimit?.toString(),
      baseFeePerGas: block.baseFeePerGas?.toString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific block
router.get('/block/:number', async (req: Request, res: Response) => {
  try {
    const blockNumber = parseInt(req.params.number, 10);
    const block = await blockchainService.getBlock(blockNumber);

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json({
      number: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      transactionCount: block.transactions.length,
      gasUsed: block.gasUsed?.toString(),
      gasLimit: block.gasLimit?.toString(),
      baseFeePerGas: block.baseFeePerGas?.toString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction
router.get('/transaction/:hash', async (req: Request, res: Response) => {
  try {
    const tx = await blockchainService.getTransaction(req.params.hash);

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gasPrice: tx.gasPrice?.toString(),
      gasLimit: tx.gasLimit.toString(),
      nonce: tx.nonce,
      data: tx.data,
      blockNumber: tx.blockNumber,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get gas prices
router.get('/gas/prices', async (req: Request, res: Response) => {
  try {
    const gasPrice = gasOracleService.getCurrentGasPrice();

    if (!gasPrice) {
      return res.status(503).json({ error: 'Gas price data not available yet' });
    }

    res.json(gasPrice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Estimate transaction cost
router.post('/gas/estimate', async (req: Request, res: Response) => {
  try {
    const { gasLimit } = req.body;

    if (!gasLimit) {
      return res.status(400).json({ error: 'gasLimit is required' });
    }

    const estimate = await gasOracleService.estimateTransactionCost(BigInt(gasLimit));
    res.json(estimate);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get MEV detections
router.get('/mev/detections', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const detections = await databaseService.getMEVAttacks(limit);

    res.json({
      count: detections.length,
      detections,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get MEV statistics
router.get('/mev/statistics', async (req: Request, res: Response) => {
  try {
    const statistics = await databaseService.getMEVStatistics();
    res.json(statistics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get MEV detections for specific user
router.get('/mev/user/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const detections = await databaseService.getMEVAttacksByUser(address);

    res.json({
      address,
      count: detections.length,
      detections,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user analytics
router.get('/analytics/user/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const analytics = await databaseService.getUserAnalytics(address);

    if (!analytics) {
      return res.status(404).json({ error: 'User analytics not found' });
    }

    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all user analytics
router.get('/analytics/users', async (req: Request, res: Response) => {
  try {
    const analytics = await databaseService.getAllUserAnalytics();
    res.json({
      count: analytics.length,
      users: analytics,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get performance metrics
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await databaseService.getPerformanceMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get account balance
router.get('/account/:address/balance', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const balance = await blockchainService.getBalance(address);

    res.json({
      address,
      balance: balance.toString(),
      balanceEth: (Number(balance) / 1e18).toFixed(6),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
