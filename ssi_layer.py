# Simulated SSI layer ? W3C VC Data Model compliant design
"""
SSI Identity Layer
Paper: Beyond Blind Trust ? Three-Tier ZK-SNARK Framework for Verifiable Clinical AI
Conference: BRAINS 2026, Florence, Italy

This module simulates the W3C Verifiable Credentials Data Model without 
requiring a full Hyperledger Indy/Aries node. It generates DIDs, creates
Verifiable Credentials, and provides verification functions.

Architecture: This is TIER 1 of the three-tier framework.
"""

import hashlib
import json
import uuid
import time
from datetime import datetime, timedelta, timezone

# ?? DID Generation ?????????????????????????????????????????????????????????
def generate_did(institution="manipal", entity_type="patient"):
    """
    Generate a W3C-compliant DID.
    Format: did:indy:manipal:<uuid>
    
    In production, this would be registered on Hyperledger Indy ledger.
    """
    unique_id = str(uuid.uuid4())[:8]
    did = f"did:indy:{institution}:{unique_id}"
    did_document = {
        "@context": "https://www.w3.org/ns/did/v1",
        "id": did,
        "controller": did,
        "created": datetime.now(timezone.utc).isoformat(),
        "authentication": [{"id": f"{did}#key-1", "type": "Ed25519VerificationKey2020"}],
        "institution": institution,
        "entity_type": entity_type
    }
    return did, did_document

# ?? Verifiable Credential ??????????????????????????????????????????????????
def create_verifiable_credential(issuer_did, holder_did, credential_type="HealthCredential"):
    """
    Create a Verifiable Credential following W3C VC Data Model.
    """
    now = datetime.now(timezone.utc)
    issuance_date = now.isoformat()
    expiration_date = (now + timedelta(days=365)).isoformat()
    
    credential = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "type": ["VerifiableCredential", credential_type],
        "issuer": {
            "id": issuer_did,
            "name": f"{issuer_did.split(':')[1].upper()} Hospital"
        },
        "issuanceDate": issuance_date,
        "expirationDate": expiration_date,
        "credentialSubject": {
            "id": holder_did,
            "credentialType": credential_type,
            "verified": True
        }
    }
    return credential

def sign_credential(credential, secret="healthcare-zkp-secret-key"):
    """
    Simulate cryptographic signing using HMAC-SHA256.
    In production, this would use Ed25519 or ECDSA signatures.
    """
    credential_copy = credential.copy()
    payload = json.dumps(credential_copy, sort_keys=True)
    signature = hashlib.sha256(
        (payload + secret).encode()
    ).hexdigest()
    credential_copy["proof"] = {
        "type": "Ed25519Signature2020",
        "created": datetime.now(timezone.utc).isoformat(),
        "proofPurpose": "assertionMethod",
        "verificationMethod": f"{credential['issuer']['id']}#key-1",
        "signatureValue": signature
    }
    return credential_copy

def verify_credential(signed_credential, secret="healthcare-zkp-secret-key"):
    """
    Verify a Verifiable Credential's signature.
    Returns True if signature is valid.
    """
    if "proof" not in signed_credential:
        return False, "No proof found in credential"
    
    proof = signed_credential.pop("proof", {})
    expected_signature = proof.get("signatureValue", "")
    
    payload = json.dumps(signed_credential, sort_keys=True)
    computed_signature = hashlib.sha256(
        (payload + secret).encode()
    ).hexdigest()
    
    signed_credential["proof"] = proof
    
    if computed_signature == expected_signature:
        return True, "Credential verified successfully"
    else:
        return False, "Signature mismatch ? credential may be tampered"

# ?? Patient Identity Verification ??????????????????????????????????????????
def verify_patient_identity(patient_id):
    """
    Full SSI verification flow for a patient before AI inference.
    
    Steps:
    1. Hospital generates its DID (issuer)
    2. Patient generates their DID (holder)
    3. Hospital issues a Verifiable Credential
    4. Credential is signed
    5. Credential is verified
    
    Returns: (is_valid, did_info, credential)
    """
    hospital_did, hospital_doc = generate_did(institution="manipal", entity_type="hospital")
    patient_did, patient_doc = generate_did(institution="manipal", entity_type="patient")
    
    credential = create_verifiable_credential(hospital_did, patient_did)
    signed_credential = sign_credential(credential)
    
    is_valid, message = verify_credential(signed_credential.copy())
    
    did_info = {
        "hospital_did": hospital_did,
        "patient_did": patient_did,
        "verification_message": message,
        "timestamp": int(time.time())
    }
    
    return is_valid, did_info, signed_credential

# ?? Test ????????????????????????????????????????????????????????????????????
if __name__ == "__main__":
    print("=" * 65)
    print("  SSI Identity Layer ? W3C VC Data Model Simulation")
    print("  TIER 1: Identity Verification")
    print("=" * 65)
    
    is_valid, did_info, credential = verify_patient_identity("PAT-1000")
    
    print(f"\n  Hospital DID    : {did_info['hospital_did']}")
    print(f"  Patient DID     : {did_info['patient_did']}")
    print(f"  Verification    : {'? VALID' if is_valid else '? INVALID'}")
    print(f"  Message         : {did_info['verification_message']}")
    print(f"\n  Credential:")
    print(f"    Type          : {credential['type']}")
    print(f"    Issuer        : {credential['issuer']['name']}")
    print(f"    Issued        : {credential['issuanceDate']}")
    print(f"    Expires       : {credential['expirationDate']}")
    print(f"    Proof Type    : {credential['proof']['type']}")
    print("=" * 65)
