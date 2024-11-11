
set -e

snarkjs powersoftau new bn128 14 ./ptau/pot12_0000.ptau -v

snarkjs powersoftau contribute ./ptau/pot12_0000.ptau ./ptau/pot12_0001.ptau \
    --name="First contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"


snarkjs powersoftau verify ./ptau/pot12_0001.ptau


snarkjs powersoftau beacon ./ptau/pot12_0001.ptau ./ptau/pot12_beacon.ptau \
    0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon"


snarkjs powersoftau prepare phase2 ./ptau/pot12_beacon.ptau ./ptau/pot12_final.ptau -v

snarkjs powersoftau verify ./ptau/pot12_final.ptau
