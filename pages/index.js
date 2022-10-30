import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Nav from '../components/nav'
import * as fcl from '@onflow/fcl'
import { useState, useEffect } from 'react'


export default function Home() {
  const [newGreeting, setNewGreeting] = useState('');
  const [greeting, setGreeting] = useState('');
  const [txStatus, setTxStatus] = useState("Run Transaction");
 
  async function runTransaction() {
    const transactionId = await fcl.mutate({
      cadence: `
      import HelloWorld from 0x3157c1d8c9199599 
  
      transaction(myNewGreeting: String) {
  
        prepare(signer: AuthAccount) {}
  
        execute {
          HelloWorld.changeGreeting(newGreeting: myNewGreeting)
        }
      }
      `,
      args: (arg, t) => [arg(newGreeting, t.String)],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999,
    })

    console.log('Here is the transactionId: ' + transactionId);
    // await fcl.tx(transactionId).onceSealed()
    // executeScript()
    fcl.tx(transactionId).subscribe(res => {
      console.log(res);
      if (res.status === 0 || res.status === 1) {
        setTxStatus('Pending...');
      } else if (res.status === 2) {
        setTxStatus('Finalized...')
      } else if (res.status === 3) {
        setTxStatus('Executed...');
      } else if (res.status === 4) {
        setTxStatus('Sealed!');
        if (res.statusCode === 0) {
            console.log('succeess!')
        setTimeout(() => setTxStatus('Run Transaction'), 2000); // We added this line
        }
      }
    })
  }

  async function executeScript() {
    const response = await fcl.query({
      cadence: `
      import HelloWorld from 0x3157c1d8c9199599

      pub fun main(): String {
          return HelloWorld.greeting
      }
      `,
      args: (arg, t) => [], // ARGUMENTS GO IN HERE
    })

    console.log('Response from Run Transaction: ' + response)
    setGreeting(response)
  }

  useEffect(() => {
    executeScript()
  }, [])

  return (
    <div>
      <Head>
        <title>Emerald DApp</title>
        <meta name="description" content="Created by Emerald Academy" />
        <link rel="icon" href="https://i.imgur.com/hvNtbgD.png" />
      </Head>

      <Nav />

    <div className={styles.welcome}>
      <h1 className={styles.title}>
         Welcome to my <a href="https://academy.ecdao.org" target="_blank" rel="noreferrer">Emerald DApp!</a>
      </h1>
      <p>This is a DApp created by Sami Peltola (<i>samipp#3884</i>).</p>
    </div>

    <main className={styles.main}>
       <p>{greeting}</p>
       <div className={styles.flex}>
        <input onChange={(e) => setNewGreeting(e.target.value)} placeholder="Hello, Friends!" />
        <button onClick={runTransaction}>{txStatus}</button>
      </div>
    </main>
    </div>
  )
}