/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/yoink.json`.
 */
export type Yoink = {
  "address": "So11111111111111111111111111111111111111112",
  "metadata": {
    "name": "yoink",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buy",
      "docs": [
        "Buys tokens from a bonding curve."
      ],
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "feeRecipient",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedUser",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "holderStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  45,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "maxSolCost",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelStreamerIdentity",
      "docs": [
        "Claims creator's share of fees (can be claimed by creator or withdraw authority)",
        "Cancel a streamer identity registration (only callable by platform authority)"
      ],
      "discriminator": [
        12,
        173,
        188,
        55,
        113,
        176,
        111,
        38
      ],
      "accounts": [
        {
          "name": "platformAuthority",
          "docs": [
            "The platform authority that can cancel Streamer identities"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "docs": [
            "The user's wallet to unlink"
          ]
        },
        {
          "name": "streamerIdentity",
          "docs": [
            "The StreamerIdentity account to close"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  101,
                  97,
                  109,
                  101,
                  114,
                  45,
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "streamerIdRegistry",
          "docs": [
            "Registry to ensure streamer_id uniqueness"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  101,
                  97,
                  109,
                  101,
                  114,
                  45,
                  105,
                  100,
                  45,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "streamerId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "streamerId",
          "type": "string"
        }
      ]
    },
    {
      "name": "claimCreatorFees",
      "discriminator": [
        0,
        23,
        125,
        234,
        156,
        118,
        134,
        89
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "streamerIdentity",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "claimDonations",
      "docs": [
        "Claim all unclaimed donations for a creator"
      ],
      "discriminator": [
        109,
        1,
        78,
        84,
        105,
        8,
        206,
        2
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "messageList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  115,
                  115,
                  97,
                  103,
                  101,
                  45,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "streamerIdentity",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "claimEarlyBirdRewards",
      "docs": [
        "Claim early bird rewards for eligible holders"
      ],
      "discriminator": [
        225,
        201,
        31,
        221,
        236,
        171,
        185,
        208
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "holderStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  45,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "create",
      "docs": [
        "Creates a new coin and bonding curve."
      ],
      "discriminator": [
        24,
        30,
        200,
        40,
        5,
        28,
        7,
        119
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "mintAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "mplTokenMetadata",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "metadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "streamerId",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "initHolderStats",
      "docs": [
        "Initialize holder stats account"
      ],
      "discriminator": [
        75,
        112,
        214,
        178,
        135,
        175,
        54,
        241
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "holderStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  45,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "associatedUser"
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Creates the global state."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "reassignFeeRecipient",
      "docs": [
        "Reassigns the fee recipient for a token, overriding creator wallet and/or streamer ID",
        "Only callable by platform authority as a failsafe for community protection"
      ],
      "discriminator": [
        156,
        205,
        230,
        65,
        172,
        171,
        174,
        191
      ],
      "accounts": [
        {
          "name": "platformAuthority",
          "docs": [
            "The platform authority that can reassign fee recipients"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "docs": [
            "The mint for the token"
          ]
        },
        {
          "name": "bondingCurve",
          "docs": [
            "The bonding curve to update"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "newRecipient",
          "type": "pubkey"
        },
        {
          "name": "newStreamerId",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "registerStreamerIdentity",
      "docs": [
        "Register a streamer identity (only callable by platform authority)"
      ],
      "discriminator": [
        172,
        112,
        1,
        154,
        112,
        185,
        163,
        96
      ],
      "accounts": [
        {
          "name": "platformAuthority",
          "docs": [
            "The platform authority that can register Streamer identities"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "docs": [
            "The user's wallet to link with Streamer"
          ]
        },
        {
          "name": "streamerIdentity",
          "docs": [
            "The StreamerIdentity account to create"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  101,
                  97,
                  109,
                  101,
                  114,
                  45,
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "streamerIdRegistry",
          "docs": [
            "Registry to ensure streamer_id uniqueness"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  101,
                  97,
                  109,
                  101,
                  114,
                  45,
                  105,
                  100,
                  45,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "streamerId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "streamerId",
          "type": "string"
        }
      ]
    },
    {
      "name": "sell",
      "docs": [
        "Sells tokens into a bonding curve."
      ],
      "discriminator": [
        51,
        230,
        133,
        164,
        1,
        127,
        131,
        173
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "feeRecipient",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedUser",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "holderStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  45,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "minSolOutput",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sendMessage",
      "docs": [
        "Send a message with a donation to a creator"
      ],
      "discriminator": [
        57,
        40,
        34,
        178,
        189,
        10,
        65,
        26
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "messageList",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  115,
                  115,
                  97,
                  103,
                  101,
                  45,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setParams",
      "docs": [
        "Sets the global state parameters."
      ],
      "discriminator": [
        27,
        234,
        178,
        52,
        147,
        2,
        187,
        141
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "feeRecipient",
          "type": "pubkey"
        },
        {
          "name": "initialVirtualTokenReserves",
          "type": "u64"
        },
        {
          "name": "initialVirtualSolReserves",
          "type": "u64"
        },
        {
          "name": "initialRealTokenReserves",
          "type": "u64"
        },
        {
          "name": "tokenTotalSupply",
          "type": "u64"
        },
        {
          "name": "feeBasisPoints",
          "type": "u64"
        },
        {
          "name": "creatorFeeShare",
          "type": "u64"
        },
        {
          "name": "platformFeeShare",
          "type": "u64"
        },
        {
          "name": "treasuryFeeShare",
          "type": "u64"
        },
        {
          "name": "earlyBirdFeeShare",
          "type": "u64"
        },
        {
          "name": "buybacksEnabled",
          "type": "bool"
        },
        {
          "name": "buybackParams",
          "type": {
            "defined": {
              "name": "buybackParams"
            }
          }
        },
        {
          "name": "earlyBirdEnabled",
          "type": "bool"
        },
        {
          "name": "earlyBirdCutoff",
          "type": "u64"
        },
        {
          "name": "earlyBirdMinBuySol",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateHolderStats",
      "docs": [
        "Update holder stats and top holders list"
      ],
      "discriminator": [
        195,
        112,
        205,
        164,
        30,
        249,
        144,
        135
      ],
      "accounts": [
        {
          "name": "mint"
        },
        {
          "name": "associatedUser",
          "writable": true
        },
        {
          "name": "holderStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  45,
                  115,
                  116,
                  97,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  45,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedUser",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "global",
      "discriminator": [
        167,
        232,
        232,
        177,
        200,
        108,
        114,
        127
      ]
    },
    {
      "name": "holderStats",
      "discriminator": [
        166,
        146,
        18,
        100,
        12,
        147,
        206,
        78
      ]
    },
    {
      "name": "messageList",
      "discriminator": [
        29,
        242,
        237,
        132,
        200,
        90,
        33,
        168
      ]
    },
    {
      "name": "streamerIdRegistry",
      "discriminator": [
        73,
        248,
        5,
        25,
        73,
        25,
        253,
        108
      ]
    },
    {
      "name": "streamerIdentity",
      "discriminator": [
        187,
        100,
        70,
        252,
        194,
        97,
        47,
        66
      ]
    }
  ],
  "events": [
    {
      "name": "completeEvent",
      "discriminator": [
        95,
        114,
        97,
        156,
        212,
        46,
        152,
        8
      ]
    },
    {
      "name": "createEvent",
      "discriminator": [
        27,
        114,
        169,
        77,
        222,
        235,
        99,
        118
      ]
    },
    {
      "name": "creatorFeeClaimedEvent",
      "discriminator": [
        90,
        52,
        142,
        211,
        70,
        79,
        77,
        169
      ]
    },
    {
      "name": "ctoEvent",
      "discriminator": [
        129,
        241,
        206,
        18,
        247,
        105,
        1,
        146
      ]
    },
    {
      "name": "donationClaimedEvent",
      "discriminator": [
        250,
        156,
        66,
        136,
        71,
        81,
        23,
        164
      ]
    },
    {
      "name": "earlyBirdClaimed",
      "discriminator": [
        214,
        48,
        215,
        163,
        239,
        214,
        199,
        55
      ]
    },
    {
      "name": "messageSentEvent",
      "discriminator": [
        210,
        253,
        9,
        196,
        155,
        27,
        172,
        145
      ]
    },
    {
      "name": "setParamsEvent",
      "discriminator": [
        223,
        195,
        159,
        246,
        62,
        48,
        143,
        131
      ]
    },
    {
      "name": "streamerIdentityCancelledEvent",
      "discriminator": [
        20,
        47,
        186,
        10,
        69,
        178,
        180,
        148
      ]
    },
    {
      "name": "streamerIdentityRegisteredEvent",
      "discriminator": [
        186,
        169,
        157,
        79,
        124,
        117,
        22,
        133
      ]
    },
    {
      "name": "tradeEvent",
      "discriminator": [
        189,
        219,
        127,
        211,
        78,
        230,
        97,
        238
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidFeeShares",
      "msg": "Fee shares must add up to 100% (10000 basis points)"
    },
    {
      "code": 6001,
      "name": "invalidStreamerId",
      "msg": "Invalid or missing streamer ID"
    },
    {
      "code": 6002,
      "name": "streamerIdAlreadyRegistered",
      "msg": "Streamer ID already registered to another wallet"
    },
    {
      "code": 6003,
      "name": "unauthorizedCreator",
      "msg": "Unauthorized creator"
    },
    {
      "code": 6004,
      "name": "noFeesToClaim",
      "msg": "No fees available to claim"
    },
    {
      "code": 6005,
      "name": "notAuthorized",
      "msg": "The given account is not authorized to execute this instruction."
    },
    {
      "code": 6006,
      "name": "alreadyInitialized",
      "msg": "The program is already initialized."
    },
    {
      "code": 6007,
      "name": "tooMuchSolRequired",
      "msg": "slippage: Too much SOL required to buy the given amount of tokens."
    },
    {
      "code": 6008,
      "name": "tooLittleSolReceived",
      "msg": "slippage: Too little SOL received to sell the given amount of tokens."
    },
    {
      "code": 6009,
      "name": "mintDoesNotMatchBondingCurve",
      "msg": "The mint does not match the bonding curve."
    },
    {
      "code": 6010,
      "name": "bondingCurveComplete",
      "msg": "The bonding curve has completed and liquidity migrated to raydium."
    },
    {
      "code": 6011,
      "name": "bondingCurveNotComplete",
      "msg": "The bonding curve has not completed."
    },
    {
      "code": 6012,
      "name": "notInitialized",
      "msg": "The program is not initialized."
    },
    {
      "code": 6013,
      "name": "unauthorizedUser",
      "msg": "Unauthorized user"
    },
    {
      "code": 6014,
      "name": "slippageExceeded",
      "msg": "Slippage tolerance exceeded"
    },
    {
      "code": 6015,
      "name": "insufficientTreasuryFunds",
      "msg": "Insufficient funds in treasury for buyback"
    },
    {
      "code": 6016,
      "name": "messageTooLong",
      "msg": "Message exceeds maximum length of 200 characters"
    },
    {
      "code": 6017,
      "name": "noDonationsToClaim",
      "msg": "No donations available to claim"
    },
    {
      "code": 6018,
      "name": "insufficientDonationAmount",
      "msg": "Insufficient donation amount"
    },
    {
      "code": 6019,
      "name": "unauthorizedDonationClaim",
      "msg": "Only the creator or withdraw authority can claim donations"
    },
    {
      "code": 6020,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6021,
      "name": "earlyBirdDisabled",
      "msg": "Early bird rewards are disabled"
    },
    {
      "code": 6022,
      "name": "notEarlyBird",
      "msg": "User is not an early bird (not in first X buyers)"
    },
    {
      "code": 6023,
      "name": "noRewardsToClaim",
      "msg": "No rewards available to claim"
    },
    {
      "code": 6024,
      "name": "noEarlyBirds",
      "msg": "No early birds registered yet"
    },
    {
      "code": 6025,
      "name": "buyAmountTooSmall",
      "msg": "Buy amount below minimum required for Early Bird eligibility"
    },
    {
      "code": 6026,
      "name": "curveNotComplete",
      "msg": "Bonding curve must be complete before claiming Early Bird rewards"
    },
    {
      "code": 6027,
      "name": "alreadyClaimedEarlyBird",
      "msg": "Early Bird rewards already claimed - can only claim once"
    },
    {
      "code": 6028,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow or underflow"
    }
  ],
  "types": [
    {
      "name": "bondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "realTokenReserves",
            "type": "u64"
          },
          {
            "name": "realSolReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "circulatingSupply",
            "type": "u64"
          },
          {
            "name": "complete",
            "type": "bool"
          },
          {
            "name": "creatorWallet",
            "type": "pubkey"
          },
          {
            "name": "creatorStreamerId",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "creatorFeePool",
            "type": "u64"
          },
          {
            "name": "treasuryFeePool",
            "type": "u64"
          },
          {
            "name": "totalFeesAccrued",
            "type": "u64"
          },
          {
            "name": "totalTreasuryFeesAccrued",
            "type": "u64"
          },
          {
            "name": "emaLotPrice",
            "type": "u64"
          },
          {
            "name": "totalBurnedSupply",
            "type": "u64"
          },
          {
            "name": "totalTreasurySpent",
            "type": "u64"
          },
          {
            "name": "earlyBirdPool",
            "type": "u64"
          },
          {
            "name": "totalBuyers",
            "type": "u64"
          },
          {
            "name": "totalEarlyBirdFeesAccrued",
            "type": "u64"
          },
          {
            "name": "earlyBirdValidCount",
            "type": "u64"
          },
          {
            "name": "earlyBirdSharePerSeat",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "buybackParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "backingMultBps",
            "type": "u16"
          },
          {
            "name": "emaDropBps",
            "type": "u16"
          },
          {
            "name": "emaAlphaBps",
            "type": "u16"
          },
          {
            "name": "spendBps",
            "type": "u16"
          },
          {
            "name": "maxSupplyBps",
            "type": "u16"
          },
          {
            "name": "minBackingLamports",
            "type": "u64"
          },
          {
            "name": "maxBurnPercentageBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "completeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bondingCurve",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "earlyBirdPool",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "createEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bondingCurve",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "creatorFeeClaimedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "claimer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalFeesAccrued",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ctoEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "oldCreator",
            "type": "pubkey"
          },
          {
            "name": "oldStreamerId",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "newCreator",
            "type": "pubkey"
          },
          {
            "name": "newStreamerId",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "platformAuthority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "donationClaimedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "remainingUnclaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "earlyBirdClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "position",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "global",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "feeRecipient",
            "type": "pubkey"
          },
          {
            "name": "initialVirtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "initialVirtualSolReserves",
            "type": "u64"
          },
          {
            "name": "initialRealTokenReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "feeBasisPoints",
            "type": "u64"
          },
          {
            "name": "creatorFeeShare",
            "type": "u64"
          },
          {
            "name": "platformFeeShare",
            "type": "u64"
          },
          {
            "name": "treasuryFeeShare",
            "type": "u64"
          },
          {
            "name": "earlyBirdFeeShare",
            "type": "u64"
          },
          {
            "name": "buybacksEnabled",
            "type": "bool"
          },
          {
            "name": "buybackParams",
            "type": {
              "defined": {
                "name": "buybackParams"
              }
            }
          },
          {
            "name": "earlyBirdEnabled",
            "type": "bool"
          },
          {
            "name": "earlyBirdCutoff",
            "type": "u64"
          },
          {
            "name": "earlyBirdMinBuySol",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "holderStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "currentBalance",
            "type": "u64"
          },
          {
            "name": "feesClaimed",
            "type": "u64"
          },
          {
            "name": "entryPosition",
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "message",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "messageList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "totalReceived",
            "type": "u64"
          },
          {
            "name": "unclaimedAmount",
            "type": "u64"
          },
          {
            "name": "messages",
            "type": {
              "vec": {
                "defined": {
                  "name": "message"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "messageSentEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "setParamsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeRecipient",
            "type": "pubkey"
          },
          {
            "name": "initialVirtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "initialVirtualSolReserves",
            "type": "u64"
          },
          {
            "name": "initialRealTokenReserves",
            "type": "u64"
          },
          {
            "name": "tokenTotalSupply",
            "type": "u64"
          },
          {
            "name": "feeBasisPoints",
            "type": "u64"
          },
          {
            "name": "creatorFeeShare",
            "type": "u64"
          },
          {
            "name": "platformFeeShare",
            "type": "u64"
          },
          {
            "name": "treasuryFeeShare",
            "type": "u64"
          },
          {
            "name": "buybacksEnabled",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "streamerIdRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "streamerId",
            "type": "string"
          },
          {
            "name": "wallet",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "streamerIdentity",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "streamerId",
            "type": "string"
          },
          {
            "name": "verified",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "streamerIdentityCancelledEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "streamerId",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "streamerIdentityRegisteredEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "streamerId",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tradeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "isBuy",
            "type": "bool"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "circulatingSupply",
            "type": "u64"
          },
          {
            "name": "realTokenReserves",
            "type": "u64"
          },
          {
            "name": "realSolReserves",
            "type": "u64"
          },
          {
            "name": "creatorFeePool",
            "type": "u64"
          },
          {
            "name": "treasuryFeePool",
            "type": "u64"
          },
          {
            "name": "totalFeesAccrued",
            "type": "u64"
          },
          {
            "name": "totalTreasuryFeesAccrued",
            "type": "u64"
          },
          {
            "name": "creatorFeeAmount",
            "type": "u64"
          },
          {
            "name": "feeRecipient",
            "type": "pubkey"
          },
          {
            "name": "isBuyback",
            "type": "bool"
          },
          {
            "name": "burnAmount",
            "type": "u64"
          },
          {
            "name": "priceLamportsPerToken",
            "type": "u64"
          },
          {
            "name": "totalBurnedSupply",
            "type": "u64"
          },
          {
            "name": "totalTreasurySpent",
            "type": "u64"
          },
          {
            "name": "earlyBirdPool",
            "type": "u64"
          },
          {
            "name": "totalEarlyBirdFeesAccrued",
            "type": "u64"
          },
          {
            "name": "userPosition",
            "type": "u64"
          },
          {
            "name": "userBalance",
            "type": "u64"
          },
          {
            "name": "earlyBirdCutoff",
            "type": "u64"
          },
          {
            "name": "totalBuyers",
            "type": "u64"
          },
          {
            "name": "earlyBirdValidCount",
            "type": "u64"
          },
          {
            "name": "isEarlyBird",
            "type": "bool"
          }
        ]
      }
    }
  ]
};

export const IDL: Yoink = require("./yoink.json");
