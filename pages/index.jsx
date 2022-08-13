import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Button, Card, Grid, Input, Spacer, Text, Textarea } from "@nextui-org/react";
import styles from "../styles/Home.module.css";

export default function Home() {
	// Contract Address & ABI
	const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
	const contractABI = abi.abi;
	// Component state
	const [currentAccount, setCurrentAccount] = useState("");
	const [name, setName] = useState("");
	const [message, setMessage] = useState("");
	const [memos, setMemos] = useState([]);
	const [owner, setOwner] = useState("");
	const [withdrawalAddress, setWithdrawalAddress] = useState("");
	const [tipsBalance, setTipsBalance] = useState(0);

	const onNameChange = (event) => {
		setName(event.target.value);
	};

	const onMessageChange = (event) => {
		setMessage(event.target.value);
	};

	const onWithdrawalChange = (event) => {
		setWithdrawalAddress(event.target.value);
	};

	// Wallet connection logic
	const isWalletConnected = async () => {
		try {
			const { ethereum } = window;

			const accounts = await ethereum.request({ method: "eth_accounts" });
			console.log("accounts: ", accounts);

			if (accounts.length > 0) {
				const account = accounts[0];
				console.log("wallet is connected! " + account);
			} else {
				console.log("make sure MetaMask is connected");
			}
		} catch (error) {
			console.log("error: ", error);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log("please install MetaMask");
			}

			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});

			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const updateWithdrawal = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum, "any");
				const signer = provider.getSigner();
				const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

				console.log("updating withdrawalAddress..");
				const updateWithdrawalTxn = await buyMeACoffee.updateWithdrawalAddress(withdrawalAddress);

				await updateWithdrawalTxn.wait();
				console.log("mined ", updateWithdrawalTxn.hash);
				console.log("withdrawalAddress updated!");

				// Clear the form fields.
				setName("");
				setMessage("");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const withdrawTips = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum, "any");
				const signer = provider.getSigner();
				const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

				console.log("withdrawing..");
				const withdrawalTxn = await buyMeACoffee.withdrawTips();

				await withdrawalTxn.wait();
				console.log("mined ", withdrawalTxn.hash);
				console.log("Withdrawal done!");

				// Clear the form fields.
				setName("");
				setMessage("");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const buyCoffee = async () => {
		try {
			const { ethereum } = window;
			console.log("buy coffee");
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum, "any");
				const signer = provider.getSigner();
				const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

				console.log("buying coffee..");
				const coffeeTxn = await buyMeACoffee.buyCoffee(name ? name : "anon", message ? message : "Enjoy your coffee!", {
					value: ethers.utils.parseEther("0.001"),
				});

				await coffeeTxn.wait();
				console.log("mined ", coffeeTxn.hash);
				console.log("coffee purchased!");

				// Clear the form fields.
				setName("");
				setMessage("");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const buyLargeCoffee = async () => {
		try {
			const { ethereum } = window;
			console.log("buy coffee");
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum, "any");
				const signer = provider.getSigner();
				const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

				console.log("buying coffee..");
				const coffeeTxn = await buyMeACoffee.buyLargeCoffee(
					name ? name : "anon",
					message ? message : "Enjoy your coffee!",
					{
						value: ethers.utils.parseEther("0.003"),
					}
				);

				await coffeeTxn.wait();
				console.log("mined ", coffeeTxn.hash);
				console.log("large coffee purchased!");

				// Clear the form fields.
				setName("");
				setMessage("");
			}
		} catch (error) {
			console.log(error);
		}
	};

	// Function to fetch all memos stored on-chain.
	const getMemos = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

				console.log("fetching memos from the blockchain..");
				const memos = await buyMeACoffee.getMemos();
				console.log("fetched!");
				setMemos(memos);
				console.log(memos);
			} else {
				console.log("Metamask is not connected");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getOwner = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);
				console.log("fetching memos from the blockchain..");
				const owner = await buyMeACoffee.getOwner();
				console.log("owner fetched!");
				setOwner(owner);

				const withdrawalAddress = await buyMeACoffee.getWithdrawalAddress();
				console.log("withdrawalAddress fetched!");
				setWithdrawalAddress(withdrawalAddress);

				const tipsBalance = await buyMeACoffee.getTipsBalance();
				console.log("tipsBalance fetched!", tipsBalance.toString());
				setTipsBalance(tipsBalance);
			} else {
				console.log("Metamask is not connected");
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		let buyMeACoffee;
		isWalletConnected();
		getMemos();
		getOwner();

		// Create an event handler function for when someone sends
		// us a new memo.
		const onNewMemo = (from, timestamp, name, message) => {
			console.log("Memo received: ", from, timestamp, name, message);
			setMemos((prevState) => [
				...prevState,
				{
					address: from,
					timestamp: new Date(timestamp * 1000),
					message,
					name,
				},
			]);
		};

		const { ethereum } = window;

		// Listen for new memo events.
		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum, "any");
			const signer = provider.getSigner();
			buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

			buyMeACoffee.on("NewMemo", onNewMemo);
		}

		return () => {
			if (buyMeACoffee) {
				buyMeACoffee.off("NewMemo", onNewMemo);
			}
		};
	}, []);

	return (
		<div className={styles.container}>
			<Head>
				<title>Buy changsheng.eth a Coffee!</title>
				<meta name="description" content="Tipping site" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className={styles.main}>
				<div className={styles.title}>
					Buy <Text h3>changsheng.eth</Text> a Coffee!
				</div>
				<Spacer y="1" />

				{currentAccount ? (
					<div>
						<Card css={{ mw: "800px" }}>
							<Card.Body>
								<form>
									<div>
										<Input id="name" label="Name" width="100%" type="text" placeholder="anon" onChange={onNameChange} />
									</div>
									<br />
									<div>
										<Textarea
											width="100%"
											rows={3}
											label="Leave a message"
											placeholder="Enjoy your coffee!"
											id="message"
											onChange={onMessageChange}
											required
										></Textarea>
									</div>
									<Spacer y="1" />
									<div>
										<Button.Group color="warning" flat>
											<Button type="button" onClick={buyCoffee}>
												Regular Coffee for 0.001ETH
											</Button>
											<Button type="button" onClick={buyLargeCoffee}>
												Large Coffee for 0.003ETH
											</Button>
										</Button.Group>
									</div>
								</form>
							</Card.Body>
						</Card>
					</div>
				) : (
					<Button onClick={connectWallet}> Connect your wallet </Button>
				)}
			</main>

			{currentAccount && <h1>Memos received</h1>}

			{currentAccount &&
				memos.map((memo, idx) => {
					return (
						<Card key={idx} style={{ width: "400px", marginBottom: "20px" }} css={{ mw: "800px" }}>
							<Card.Header>
								<Grid.Container>
									<Grid xs={6}>
										<Text>From: {memo.name}</Text>
									</Grid>
									<Grid xs={6}>
										<Text>Timestamp: {memo.timestamp.toString()}</Text>
									</Grid>
									<Grid>
										<Text>Size: {memo.coffeeSize}</Text>
									</Grid>
								</Grid.Container>
							</Card.Header>
							<Card.Divider></Card.Divider>
							<Card.Body>
								<Text>Message: {memo.message}</Text>
							</Card.Body>
						</Card>
					);
				})}

			<Spacer y="3" />
			{currentAccount && (
				<>
					<h1>Withdrawal</h1>
					<Grid.Container>
						<Grid xs={12} style={{ justifyContent: "center" }}>
							<Text h3>Owner: {owner}</Text>
						</Grid>
						<Grid xs={12} style={{ justifyContent: "center" }}>
							<Text h3>Withdrawal Address:</Text>
							<Input style={{ width: "400px" }} placeholder={withdrawalAddress} onChange={onWithdrawalChange}></Input>
						</Grid>
						<Spacer y={1} />
						<Grid xs={12} style={{ justifyContent: "center" }}>
							<Button onClick={updateWithdrawal}>Update</Button>
						</Grid>
						<Spacer y={3} />
						<Grid xs={12} style={{ justifyContent: "center" }}>
							<Text h3>Tips Balance: {ethers.utils.formatEther(tipsBalance)} Ether</Text>
						</Grid>
						<Spacer y={1} />
						<Grid xs={12} style={{ justifyContent: "center" }}>
							<Button onClick={withdrawTips}>Withdraw</Button>
						</Grid>
					</Grid.Container>
				</>
			)}
			<Spacer y="3" />

			<footer className={styles.footer}>
				<a href="https://alchemy.com/?a=roadtoweb3weektwo" target="_blank" rel="noopener noreferrer">
					Created by @thatguyintech and updated by @changsheng.eth for Alchemy's Road to Web3 lesson two!
				</a>
			</footer>
		</div>
	);
}
