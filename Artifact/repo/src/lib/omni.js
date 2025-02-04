const omni = {
    development: [
      {
        inputs: [
          {
            internalType: "address",
            name: "_oldContractAddress",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [],
        name: "ECDSAInvalidSignature",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "length",
            type: "uint256",
          },
        ],
        name: "ECDSAInvalidSignatureLength",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
        ],
        name: "ECDSAInvalidSignatureS",
        type: "error",
      },
      {
        inputs: [],
        name: "EnforcedPause",
        type: "error",
      },
      {
        inputs: [],
        name: "ExpectedPause",
        type: "error",
      },
      {
        inputs: [],
        name: "IdAlreadyAssigned",
        type: "error",
      },
      {
        inputs: [],
        name: "InterfaceUnsupported",
        type: "error",
      },
      {
        inputs: [],
        name: "InvalidShortString",
        type: "error",
      },
      {
        inputs: [],
        name: "KeyAlreadyProvisioned",
        type: "error",
      },
      {
        inputs: [],
        name: "KeyNotProvisioned",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "OwnableInvalidOwner",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error",
      },
      {
        inputs: [],
        name: "PreExists",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "expiredAt",
            type: "uint256",
          },
        ],
        name: "SignatureExpired",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "str",
            type: "string",
          },
        ],
        name: "StringTooLong",
        type: "error",
      },
      {
        inputs: [],
        name: "Unauthorized",
        type: "error",
      },
      {
        anonymous: false,
        inputs: [],
        name: "EIP712DomainChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "bytes32",
            name: "assignee",
            type: "bytes32",
          },
        ],
        name: "IdentityCreated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
        ],
        name: "IdentityDestroyed",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
        ],
        name: "IdentityGranted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
        ],
        name: "IdentityRevoked",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "OwnershipTransferred",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "Paused",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "contract IPermitter",
            name: "permitter",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "status",
            type: "bool",
          },
        ],
        name: "PermitterStatusUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "registrant",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "status",
            type: "bool",
          },
        ],
        name: "RegistrantStatusUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "Unpaused",
        type: "event",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "_assigneeHash",
            type: "bytes32",
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: "IdentityId",
                    name: "identity",
                    type: "uint256",
                  },
                  {
                    internalType: "address",
                    name: "requester",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "expiry",
                    type: "uint256",
                  },
                ],
                internalType: "struct OmniKeyStore.KeyRequest",
                name: "req",
                type: "tuple",
              },
              {
                internalType: "bytes",
                name: "sig",
                type: "bytes",
              },
            ],
            internalType: "struct OmniKeyStore.SignedKeyRequest",
            name: "signedKeyReq",
            type: "tuple",
          },
        ],
        name: "autoMigration",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "assignee",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "salt",
            type: "bytes",
          },
        ],
        name: "createIdentity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
        ],
        name: "destroyIdentity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "eip712Domain",
        outputs: [
          {
            internalType: "bytes1",
            name: "fields",
            type: "bytes1",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "version",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "chainId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "verifyingContract",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "salt",
            type: "bytes32",
          },
          {
            internalType: "uint256[]",
            name: "extensions",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
          },
        ],
        name: "fetchIdentity",
        outputs: [
          {
            internalType: "IdentityId",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            components: [
              {
                components: [
                  {
                    internalType: "IdentityId",
                    name: "identity",
                    type: "uint256",
                  },
                  {
                    internalType: "address",
                    name: "requester",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "expiry",
                    type: "uint256",
                  },
                ],
                internalType: "struct OmniKeyStore.KeyRequest",
                name: "req",
                type: "tuple",
              },
              {
                internalType: "bytes",
                name: "sig",
                type: "bytes",
              },
            ],
            internalType: "struct OmniKeyStore.SignedKeyRequest",
            name: "signedKeyReq",
            type: "tuple",
          },
        ],
        name: "getKey",
        outputs: [
          {
            internalType: "OmniKeyStore.Key",
            name: "",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "identityId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
        ],
        name: "getPermittedAccountAtIndex",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "identityId",
            type: "uint256",
          },
        ],
        name: "getPermittedAccountsLength",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            components: [
              {
                components: [
                  {
                    internalType: "IdentityId",
                    name: "identity",
                    type: "uint256",
                  },
                  {
                    internalType: "address",
                    name: "requester",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "expiry",
                    type: "uint256",
                  },
                ],
                internalType: "struct OmniKeyStore.KeyRequest",
                name: "req",
                type: "tuple",
              },
              {
                internalType: "bytes",
                name: "sig",
                type: "bytes",
              },
            ],
            internalType: "struct OmniKeyStore.SignedKeyRequest",
            name: "signedKeyReq",
            type: "tuple",
          },
        ],
        name: "getSecondaryKey",
        outputs: [
          {
            internalType: "OmniKeyStore.Key",
            name: "",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "expiry",
            type: "uint64",
          },
        ],
        name: "grantIdentity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "",
            type: "uint256",
          },
        ],
        name: "idRegistration",
        outputs: [
          {
            internalType: "bool",
            name: "registered",
            type: "bool",
          },
          {
            internalType: "bytes32",
            name: "assigneeHash",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "contract IPermitter",
            name: "",
            type: "address",
          },
        ],
        name: "isPermitter",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_addr",
            type: "address",
          },
        ],
        name: "isValidRegistrant",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "assigneeHash",
            type: "bytes32",
          },
          {
            internalType: "IdentityId",
            name: "iDs",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "secrets",
            type: "bytes32",
          },
        ],
        name: "manualMigration",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "paused",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "identityId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "salt",
            type: "bytes",
          },
        ],
        name: "provisionSecondaryKey",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "holder",
            type: "address",
          },
          {
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
        ],
        name: "readPermit",
        outputs: [
          {
            components: [
              {
                internalType: "uint64",
                name: "expiry",
                type: "uint64",
              },
            ],
            internalType: "struct IIdentityRegistry.Permit",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        name: "registrantStatus",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
        ],
        name: "revokeIdentity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "identityId",
            type: "uint256",
          },
        ],
        name: "rotateKeys",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "permitter",
            type: "address",
          },
          {
            internalType: "bool",
            name: "status",
            type: "bool",
          },
        ],
        name: "setPermitter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "registrant",
            type: "address",
          },
          {
            internalType: "bool",
            name: "status",
            type: "bool",
          },
        ],
        name: "setRegistrant",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4",
          },
        ],
        name: "supportsInterface",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "togglePause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    production: [
      {
        inputs: [
          {
            internalType: "address",
            name: "_oldContractAddress",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [],
        name: "ECDSAInvalidSignature",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "length",
            type: "uint256",
          },
        ],
        name: "ECDSAInvalidSignatureLength",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
        ],
        name: "ECDSAInvalidSignatureS",
        type: "error",
      },
      {
        inputs: [],
        name: "EnforcedPause",
        type: "error",
      },
      {
        inputs: [],
        name: "ExpectedPause",
        type: "error",
      },
      {
        inputs: [],
        name: "IdAlreadyAssigned",
        type: "error",
      },
      {
        inputs: [],
        name: "InterfaceUnsupported",
        type: "error",
      },
      {
        inputs: [],
        name: "InvalidShortString",
        type: "error",
      },
      {
        inputs: [],
        name: "KeyAlreadyProvisioned",
        type: "error",
      },
      {
        inputs: [],
        name: "KeyNotProvisioned",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "OwnableInvalidOwner",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error",
      },
      {
        inputs: [],
        name: "PreExists",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "expiredAt",
            type: "uint256",
          },
        ],
        name: "SignatureExpired",
        type: "error",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "str",
            type: "string",
          },
        ],
        name: "StringTooLong",
        type: "error",
      },
      {
        inputs: [],
        name: "Unauthorized",
        type: "error",
      },
      {
        anonymous: false,
        inputs: [],
        name: "EIP712DomainChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "bytes32",
            name: "assignee",
            type: "bytes32",
          },
        ],
        name: "IdentityCreated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
        ],
        name: "IdentityDestroyed",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
        ],
        name: "IdentityGranted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
        ],
        name: "IdentityRevoked",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "OwnershipTransferred",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "Paused",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "contract IPermitter",
            name: "permitter",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "status",
            type: "bool",
          },
        ],
        name: "PermitterStatusUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "registrant",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "status",
            type: "bool",
          },
        ],
        name: "RegistrantStatusUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        name: "Unpaused",
        type: "event",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "_assigneeHash",
            type: "bytes32",
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: "IdentityId",
                    name: "identity",
                    type: "uint256",
                  },
                  {
                    internalType: "address",
                    name: "requester",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "expiry",
                    type: "uint256",
                  },
                ],
                internalType: "struct OmniKeyStore.KeyRequest",
                name: "req",
                type: "tuple",
              },
              {
                internalType: "bytes",
                name: "sig",
                type: "bytes",
              },
            ],
            internalType: "struct OmniKeyStore.SignedKeyRequest",
            name: "signedKeyReq",
            type: "tuple",
          },
        ],
        name: "autoMigration",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "assignee",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "salt",
            type: "bytes",
          },
        ],
        name: "createIdentity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
        ],
        name: "destroyIdentity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "eip712Domain",
        outputs: [
          {
            internalType: "bytes1",
            name: "fields",
            type: "bytes1",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "version",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "chainId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "verifyingContract",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "salt",
            type: "bytes32",
          },
          {
            internalType: "uint256[]",
            name: "extensions",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "",
            type: "bytes32",
          },
        ],
        name: "fetchIdentity",
        outputs: [
          {
            internalType: "IdentityId",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            components: [
              {
                components: [
                  {
                    internalType: "IdentityId",
                    name: "identity",
                    type: "uint256",
                  },
                  {
                    internalType: "address",
                    name: "requester",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "expiry",
                    type: "uint256",
                  },
                ],
                internalType: "struct OmniKeyStore.KeyRequest",
                name: "req",
                type: "tuple",
              },
              {
                internalType: "bytes",
                name: "sig",
                type: "bytes",
              },
            ],
            internalType: "struct OmniKeyStore.SignedKeyRequest",
            name: "signedKeyReq",
            type: "tuple",
          },
        ],
        name: "getKey",
        outputs: [
          {
            internalType: "OmniKeyStore.Key",
            name: "",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "identityId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
        ],
        name: "getPermittedAccountAtIndex",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "identityId",
            type: "uint256",
          },
        ],
        name: "getPermittedAccountsLength",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            components: [
              {
                components: [
                  {
                    internalType: "IdentityId",
                    name: "identity",
                    type: "uint256",
                  },
                  {
                    internalType: "address",
                    name: "requester",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "expiry",
                    type: "uint256",
                  },
                ],
                internalType: "struct OmniKeyStore.KeyRequest",
                name: "req",
                type: "tuple",
              },
              {
                internalType: "bytes",
                name: "sig",
                type: "bytes",
              },
            ],
            internalType: "struct OmniKeyStore.SignedKeyRequest",
            name: "signedKeyReq",
            type: "tuple",
          },
        ],
        name: "getSecondaryKey",
        outputs: [
          {
            internalType: "OmniKeyStore.Key",
            name: "",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint64",
            name: "expiry",
            type: "uint64",
          },
        ],
        name: "grantIdentity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "",
            type: "uint256",
          },
        ],
        name: "idRegistration",
        outputs: [
          {
            internalType: "bool",
            name: "registered",
            type: "bool",
          },
          {
            internalType: "bytes32",
            name: "assigneeHash",
            type: "bytes32",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "contract IPermitter",
            name: "",
            type: "address",
          },
        ],
        name: "isPermitter",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_addr",
            type: "address",
          },
        ],
        name: "isValidRegistrant",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes32",
            name: "assigneeHash",
            type: "bytes32",
          },
          {
            internalType: "IdentityId",
            name: "iDs",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "secrets",
            type: "bytes32",
          },
        ],
        name: "manualMigration",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "paused",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "identityId",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "salt",
            type: "bytes",
          },
        ],
        name: "provisionSecondaryKey",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "holder",
            type: "address",
          },
          {
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
        ],
        name: "readPermit",
        outputs: [
          {
            components: [
              {
                internalType: "uint64",
                name: "expiry",
                type: "uint64",
              },
            ],
            internalType: "struct IIdentityRegistry.Permit",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        name: "registrantStatus",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
        ],
        name: "revokeIdentity",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "IdentityId",
            name: "identityId",
            type: "uint256",
          },
        ],
        name: "rotateKeys",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "permitter",
            type: "address",
          },
          {
            internalType: "bool",
            name: "status",
            type: "bool",
          },
        ],
        name: "setPermitter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "registrant",
            type: "address",
          },
          {
            internalType: "bool",
            name: "status",
            type: "bool",
          },
        ],
        name: "setRegistrant",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4",
          },
        ],
        name: "supportsInterface",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "togglePause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  };
  
  const environment = process.env.REACT_APP_ENVIRONMENT === "production" ? "production" : "development";
  
  const omniSelected = omni[environment];
  
  export { omniSelected as omniAbi };
  