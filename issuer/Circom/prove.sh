#!/bin/sh
set -e

# --------------------------------------------------------------------------------
# Phase 2
# ... circuit-specific stuff

# Compile the circuit. Creates the files:
# - circuit.r1cs: the r1cs constraint system of the circuit in binary format
# - circuit_js folder: wasm and witness tools
# - circuit.sym: a symbols file required for debugging and printing the constraint system in an annotated mode
circom ./age.circom -o ./ --r1cs --wasm --sym
# Optional - view circuit state info
# snarkjs r1cs info ./circuit.r1cs

# Optional - print the constraints
# snarkjs r1cs print ./circuit.r1cs ./circuit.sym

# Optional - export the r1cs
# yarn snarkjs r1cs export json ./zk/circuit.r1cs ./zk/circuit.r1cs.json && cat circuit.r1cs.json
# or...
# yarn zk:export-r1cs

# Generate witness
snarkjs wc ./age_js/age.wasm ./input.json witness.wtns
# Setup (use plonk so we can skip ptau phase 2
snarkjs groth16 setup ./age.r1cs ./ptau/pot12_final.ptau ./zkey/circuit_final.zkey

# Generate reference zkey
snarkjs zkey new ./age.r1cs ./ptau/pot12_final.ptau ./zkey/circuit_0000.zkey

# Ceremony just like before but for zkey this time
snarkjs zkey contribute ./zkey/circuit_0000.zkey ./zkey/circuit_0001.zkey \
    --name="First contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"


#  Verify zkey
snarkjs zkey verify ./age.r1cs ./ptau/pot12_final.ptau ./zkey/circuit_0001.zkey

# Apply random beacon as before
snarkjs zkey beacon ./zkey/circuit_0001.zkey ./zkey/circuit_final.zkey \
    0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"

# Optional: verify final zkey
snarkjs zkey verify ./age.r1cs ./ptau/pot12_final.ptau ./zkey/circuit_final.zkey

# Export verification key
snarkjs zkey export verificationkey ./zkey/circuit_final.zkey ./verification_key.json

# Create the proof
snarkjs groth16 prove ./zkey/circuit_final.zkey ./witness.wtns \
    ./proof/proof.json ./proof/public.json

# Verify the proof
snarkjs groth16 verify ./verification_key.json ./proof/public.json ./proof/proof.json

# Export the verifier as a smart contract
snarkjs zkey export solidityverifier ./zkey/circuit_final.zkey ./contracts/Verifier.sol
