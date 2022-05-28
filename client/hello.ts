

import {
    Connection,
} from "@solana/web3.js"

//import * as os from 'os';
//import * as path from 'path';
//import * as fs from 'fs';
//import * as yaml from 'yaml';

import os from 'os';
import fs from 'mz/fs';
import path from 'path';
import yaml from 'yaml';
import {Keypair} from '@solana/web3.js';

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


  async function main() {
    console.log("Let's say hello to a Solana account...");
  
    // Establish connection to the cluster
    await establishConnection();
  
    /*
    // Determine who pays for the fees
    await establishPayer();
  
    // Check if the program has been deployed
    await checkProgram();
  
    // Say hello to an account
    await sayHello();
  
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