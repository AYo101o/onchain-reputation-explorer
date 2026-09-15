#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Bytes, Env};

#[test]
fn test_issue_attestation() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, AttestationContract);
    let client = AttestationContractClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let subject = Address::generate(&env);
    let schema_id = Symbol::new(&env, "kyc");
    let data = Bytes::from_array(&env, &[1, 2, 3]);

    client.issue_attestation(&issuer, &subject, &schema_id, &data);
}

#[test]
fn test_get_attestations() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, AttestationContract);
    let client = AttestationContractClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let subject = Address::generate(&env);
    let schema_id = Symbol::new(&env, "kyc");
    let data = Bytes::from_array(&env, &[1, 2, 3]);

    client.issue_attestation(&issuer, &subject, &schema_id, &data);

    let results = client.get_attestations(&subject);
    assert_eq!(results.len(), 1);
    assert_eq!(results.get(0).unwrap().schema_id, schema_id);
}