#![no_std]
mod test;

use soroban_sdk::{contract, contractimpl, contracttype, Address, Bytes, Env, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Attestation {
    pub issuer: Address,
    pub subject: Address,
    pub schema_id: Symbol,
    pub data: Bytes,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Attestations(Address),
}

#[contract]
pub struct AttestationContract;

#[contractimpl]
impl AttestationContract {
    pub fn issue_attestation(
        env: Env,
        issuer: Address,
        subject: Address,
        schema_id: Symbol,
        data: Bytes,
    ) {
        issuer.require_auth();

        let attestation = Attestation {
            issuer,
            subject: subject.clone(),
            schema_id,
            data,
            timestamp: env.ledger().timestamp(),
        };

        let key = DataKey::Attestations(subject);
        let mut list: Vec<Attestation> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(Vec::new(&env));

        list.push_back(attestation);
        env.storage().persistent().set(&key, &list);
    }
}
