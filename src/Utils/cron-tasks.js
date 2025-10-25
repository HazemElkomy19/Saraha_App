import { blackListedTokensModel } from "../DB/Models/index.js"; 


export const cleanupExpiredTokens = async () => {
  try {
    console.log('CRON JOB: Running cleanup for expired tokens...');

    const result = await blackListedTokensModel.deleteMany({ 
      expirationDate: { $lt: new Date() } 
    });

    if (result.deletedCount > 0) {
      console.log(`CRON JOB: Successfully deleted ${result.deletedCount} expired tokens.`);
    } else {
      console.log('CRON JOB: No expired tokens found to delete.');
    }

  } catch (error) {
    console.error('CRON JOB ERROR: Failed to delete expired tokens:', error.message);
  }
};