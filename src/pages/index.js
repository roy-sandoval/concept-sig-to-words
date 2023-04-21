import { useEffect, useState } from 'react';

const bip39 = require('bip39');

export default function Home() {
  const sig =
    '0xb23e7dc2a1b9ee7ca1bbfc62e3d6f04e6e1b956af436c6f90e6e9f0baa7e18a322e1e51758c0e75811d02292e79d47d5462a614e7ca8d6e55088b8781d121080a';
  const phone = '+523111085816';
  const [words, setWords] = useState();
  const [ogWordHash, setOGWordHash] = useState('');

  async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex;
  }

  function hex2bin(hex) {
    hex = hex.replace('0x', '').toLowerCase();
    let out = '';
    for (let c of hex) {
      switch (c) {
        case '0':
          out += '0000';
          break;
        case '1':
          out += '0001';
          break;
        case '2':
          out += '0010';
          break;
        case '3':
          out += '0011';
          break;
        case '4':
          out += '0100';
          break;
        case '5':
          out += '0101';
          break;
        case '6':
          out += '0110';
          break;
        case '7':
          out += '0111';
          break;
        case '8':
          out += '1000';
          break;
        case '9':
          out += '1001';
          break;
        case 'a':
          out += '1010';
          break;
        case 'b':
          out += '1011';
          break;
        case 'c':
          out += '1100';
          break;
        case 'd':
          out += '1101';
          break;
        case 'e':
          out += '1110';
          break;
        case 'f':
          out += '1111';
          break;
        default:
          return '';
      }
    }
    return out;
  }

  function findMnemonic(input) {
    let words = [];

    const bits_one = input.slice(0, 11);
    const bits_two = input.slice(253, 264);
    const bits_three = input.slice(517, 528);

    let bits = [bits_one, bits_two, bits_three];

    for (let co = 0; co < bits.length; co++) {
      if (co < 3) {
        let biDec = parseInt(bits[co], 2);
        words.push(bip39.wordlists.english[biDec]);
      } else break;
    }
    return words;
  }

  async function createWordHash(words) {
    const word_1_hash = await sha256(words[0] + phone);
    const word_2_hash = await sha256(word_1_hash + words[1]);
    const wordHash = await sha256(word_2_hash + words[2]);
    return wordHash;
  }

  async function generateWords() {
    const shaSig = await sha256(sig);
    const shaBin = hex2bin(shaSig).substring(0, 12);
    const binSig = hex2bin(sig);
    const secret = shaBin + binSig;
    setWords(findMnemonic(secret));
    console.log('Generated!');
  }

  async function checkSecret() {
    const inputWords = ['bleak', 'course', 'access'];
    const inputWordHash = await createWordHash(inputWords);
    if (inputWordHash === ogWordHash) {
      console.log('TRUE! Sending you your funds!');
    } else {
      console.log('Incorrect secret.');
    }
  }

  useEffect(() => {
    if (words) {
      async function fetchWordHash() {
        const wordHash = await createWordHash(words);
        setOGWordHash(wordHash);
      }
      fetchWordHash();
    }
  }, [words]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>sig to words</div>
      <button onClick={generateWords}>Generate secret</button>
      <button
        onClick={() => {
          console.log(words);
        }}
      >
        Log secret
      </button>
      <button onClick={checkSecret}>Check secret</button>
    </main>
  );
}
