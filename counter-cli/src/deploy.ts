import path from 'path';
import * as fs from 'fs';
import * as readline from 'readline/promises';
import * as api from './api';
import { currentDir, UndeployedConfig } from './config';
import { createLogger } from './logger';
import 'dotenv/config';

let logger: Awaited<ReturnType<typeof createLogger>>;

async function main() {
    console.log('🔐 Midnight Age Verification Contract Deployment\n');
    console.log('Using local network with existing containers...\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let wallet: api.WalletContext | null = null;

    try {
        const logDir = path.resolve(
            currentDir,
            '..',
            'logs',
            'deploy',
            `${new Date().toISOString()}.log`
        );

        logger = await createLogger(logDir);
        api.setLogger(logger);

        // Skip interactive input and use genesis wallet
        const walletSeed = '0000000000000000000000000000000000000000000000000000000000000001';
        console.log('\nUsing genesis wallet seed for local network.\n');

        // rl.close(); // Not needed as we didn't use it meaningfully
        api.setLogger(logger);

        const config = new UndeployedConfig();

        console.log('Building wallet...');
        wallet = await api.buildWalletAndWaitForFunds(config, walletSeed);

        console.log('Configuring providers...');
        const providers = await api.configureProviders(wallet, config);

        console.log('Deploying age verification contract. This may take 30–60 seconds...');
        const deployedContract = await api.deploy(providers, { privateCounter: 0 });

        const contractAddress =
            deployedContract.deployTxData.public.contractAddress;

        const deploymentInfo = {
            contractAddress,
            deployedAt: new Date().toISOString(),
            network: 'local',
            config: {
                indexer: config.indexer,
                indexerWS: config.indexerWS,
                node: config.node,
                proofServer: config.proofServer,
            },
        };

        const deploymentPath = path.resolve(
            currentDir,
            '..',
            '..',
            'deployment.json'
        );

        fs.writeFileSync(
            deploymentPath,
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log('\n✅ AGE VERIFICATION CONTRACT DEPLOYED SUCCESSFULLY');
        console.log(`Contract Address: ${contractAddress}\n`);
        console.log(`Deployment info saved at: ${deploymentPath}`);

        process.on('SIGINT', async () => {
            if (wallet) await api.closeWallet(wallet);
            process.exit(0);
        });

        // Keep process running
        await new Promise(() => { });
    } catch (error) {
        rl.close();
        if (wallet) await api.closeWallet(wallet);
        console.error('Deployment failed:', error);
        process.exit(1);
    }
}

main().catch(console.error);
