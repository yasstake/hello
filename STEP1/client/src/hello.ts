
import {
    Connection,
    Keypair,
    TransactionInstruction,
    sendAndConfirmTransaction,
    Transaction,
    PublicKey
} from '@solana/web3.js';

import fs from 'mz/fs';

async function readKeyPair(filePath: string): Promise<Keypair> {
    const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const programKeyPair = Keypair.fromSecretKey(secretKey);

    return programKeyPair;
}

async function readProgramId() {
    let programKeyPath = './server/dist/hello-keypair.json';
    const programKeyPair = await readKeyPair(programKeyPath);
    return programKeyPair.publicKey;
}

async function readPayerKeyPair() {
    let keyPath = './solana-wallet/keypair.json'
    const programKeyPair = await readKeyPair(keyPath);
    return programKeyPair;    
}

async function callTransaction(){
    let rpcUrl = 'http://127.0.0.1:8899';
    let connection = new Connection(rpcUrl, 'confirmed');

    let payer = await readPayerKeyPair();
    let programId = await readProgramId()

    const instruction = new TransactionInstruction({
      keys: [],
      programId,
      data: Buffer.alloc(0),
    });

    let transaction = new Transaction();
    transaction.add(instruction);

    sendAndConfirmTransaction(
        connection,
        transaction,
        [payer]
    );
}

callTransaction();


