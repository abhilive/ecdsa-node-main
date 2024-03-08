import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import {secp256k1} from 'ethereum-cryptography/secp256k1';
import { toHex,utf8ToBytes } from 'ethereum-cryptography/utils';
import { keccak256 } from "ethereum-cryptography/keccak";

// private key 06b9be095a37bb89f23c2a16ebd18a643f53102a51ca7a6e449491d351c2971b
// public key: 025ea9e28544643d0350292f3fae6a286ada5608d47e3d407b5089745a0c71525c
// Initial Balance: 100

// private key 8cd28c9c02e44bbd5996d3214454e8db328c00efac8ca1ccbf136ba7d80db1a2
// public key: 0330b6392870bc675c988e3dc2a3c40a4f4e61c50ea1a891177698b3915f2fb322
// Initial Balance: 50

// private key a79d91a28cc3ec96288908bc6376c49b05b406129fd517886e097cfb2830ba23
// public key: 03d18641eb0f30b0cebe1efe5573dd459101d14b7be4b6aeb7281e55738d26b9ad
// Initial Balance: 75

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const hashMessage = message => keccak256(Uint8Array.from(message));
  const signMessage = msg => secp256k1.sign(hashMessage(msg),privateKey);

  async function transfer(evt) {
    evt.preventDefault();

    const msg = { amount: parseInt(sendAmount), recipient };
    const sig = signMessage(msg);

    const stringifyBigInts = obj =>{
      for(let prop in obj){
        let value = obj[prop];
        if(typeof value === 'bigint'){
          obj[prop] = value.toString();
        }else if(typeof value === 'object' && value !== null){
          obj[prop] = stringifyBigInts(value);
        }
      }
      return obj;
    }

    // stringify bigints before sending to server
    const sigStringed = stringifyBigInts(sig);
  
    const tx = {
      sig:sigStringed, msg, sender: address
    }

    try {
      const {
        data: { balance },
      } = await server.post(`send`, tx);
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;