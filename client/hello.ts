

import {
    Keypair,
    Connection,
    LAMPORTS_PER_SOL,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey,
    TransactionInstruction,
} from "@solana/web3.js"

//import * as os from 'os';
//import * as path from 'path';
//import * as fs from 'fs';
//import * as yaml from 'yaml';

import os from 'os';
import fs from 'mz/fs';
import path from 'path';
import yaml from 'yaml';
import * as borsh from 'borsh';


/**
 * Connection to the network
 */
 let connection: Connection;

/**
 * @private
 */
 async function getConfig(): Promise<any> {
    // Path to Solana CLI config file
    const CONFIG_FILE_PATH = path.resolve(
      os.homedir(),
      '.config',
      'solana',
      'cli',
      'config.yml',
    );
    const configYml = await fs.readFile(CONFIG_FILE_PATH, {encoding: 'utf8'});
    return yaml.parse(configYml);
  }

/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */
 export async function getRpcUrl(): Promise<string> {
    try {
      const config = await getConfig();
      if (!config.json_rpc_url) throw new Error('Missing RPC URL');
      return config.json_rpc_url;
    } catch (err) {
      console.warn(
        'Failed to read RPC url from CLI config file, falling back to localhost',
      );
      return 'http://127.0.0.1:8899';
    }
  }


/**
 * Establish a connection to the cluster
 */
 export async function establishConnection(): Promise<void> {
    const rpcUrl = await getRpcUrl();
    connection = new Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    console.log('Connection to cluster established:', rpcUrl, version);
  }

/**
 * Keypair associated to the fees' payer
 */
 let payer: Keypair;

/**
 * The state of a greeting account managed by the hello world program
 */
 class GreetingAccount {
  counter = 0;
  constructor(fields: {counter: number} | undefined = undefined) {
    if (fields) {
      this.counter = fields.counter;
    }
  }
}

/**
 * Borsh schema definition for greeting accounts
 */
const GreetingSchema = new Map([
  [GreetingAccount, {kind: 'struct', fields: [['counter', 'u32']]}],
]);

/**
 * The expected size of each greeting account.
 */
const GREETING_SIZE = borsh.serialize(
  GreetingSchema,
  new GreetingAccount(),
).length;




/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
 export async function createKeypairFromFile(
  filePath: string,
): Promise<Keypair> {
  const secretKeyString = await fs.readFile(filePath, {encoding: 'utf8'});
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}


/**
 * Load and parse the Solana CLI config file to determine which payer to use
 */
 export async function getPayer(): Promise<Keypair> {
  try {
    const config = await getConfig();
    if (!config.keypair_path) throw new Error('Missing keypair path');
    return await createKeypairFromFile(config.keypair_path);
  } catch (err) {
    console.warn(
      'Failed to create keypair from CLI config file, falling back to new random keypair',
    );
    return Keypair.generate();
  }
}

  /**
 * Establish an account to pay for everything
 */
export async function establishPayer(): Promise<void> {
  let fees = 0;
  if (!payer) {

    const {feeCalculator} = await connection.getRecentBlockhash();
    // const {feeCalculator} = await connection.getLatestBlockhash()

    // Calculate the cost to fund the greeter account
    fees += await connection.getMinimumBalanceForRentExemption(GREETING_SIZE);

    // Calculate the cost of sending transactions
    fees += feeCalculator.lamportsPerSignature * 100; // wag

    console.log("FEE IS " + fees)

    payer = await getPayer();
  }
}

/**
 * Path to program files
 */
 const PROGRAM_PATH = path.resolve(__dirname, '../server/hello/target/deploy');

 /**
  * Path to program shared object file which should be deployed on chain.
  * This file is created when running either:
  *   - `npm run build:program-c`
  *   - `npm run build:program-rust`
  */
 const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'hello.so');

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/helloworld.so`
 */
 const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'hello-keypair.json');

/**
 * Hello world's program id
 */
 let programId: PublicKey;

/**
 * Check if the hello world BPF program has been deployed
 */
 export async function checkProgram(): Promise<void> {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/helloworld.so\``,
    );
  }
}

/**
 * The public key of the account we are saying hello to
 */
 let greetedPubkey: PublicKey;




/**
 * Say hello
 */
 export async function sayHello(): Promise<void> {
  const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
  programId = programKeypair.publicKey;

  // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
  const GREETING_SEED = 'hello';
  greetedPubkey = await PublicKey.createWithSeed(
    payer.publicKey,
    GREETING_SEED,
    programId,
  );


  console.log('Saying hello to', greetedPubkey.toBase58());
  const instruction = new TransactionInstruction({
    keys: [{pubkey: greetedPubkey, isSigner: false, isWritable: true}],
    programId,
    data: Buffer.alloc(0), // All instructions are hellos
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
}






  async function main() {
    console.log("Let's say hello to a Solana account...");
  
    // Establish connection to the cluster
    const url = 'http://127.0.0.1:8899'
    connection = new Connection(url, 'confirmed')

    await establishConnection();
      
    
    // Determine who pays for the fees
    await establishPayer();
  

    // Check if the program has been deployed
    await checkProgram();
  
    // Say hello to an account
    await sayHello();
    
    /*  
    // Find out how many times that account has been greeted
    await reportGreetings();
    */
    console.log('Success');
  }

  main().then(
    () => process.exit(),
    err => {
      console.error(err);
      process.exit(-1);
    },
  );