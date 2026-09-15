#![no_std]
use soroban_sdk::{contract, contracttype, Address, Bytes, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct Attestation {
    pub issuer: Address,
    pub subject: Address,
    pub schema_id: Symbol,
    pub data: Bytes,
    pub timestamp: u64,
}

#[contract]
pub struct AttestationContract;