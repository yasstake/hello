#!/bin/sh

mkdir ./solana-wallet
solana-keygen new --no-passphrase --outfile ./solana-wallet/keypair.json

PUBKEY=`solana-keygen pubkey ./solana-wallet/keypair.json`

solana airdrop 1 $PUBKEY




