import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import { ethers } from "ethers";
import { useNotification } from "@web3uikit/core";

export default function LotteryEntrance() {
	const dispatch = useNotification();
	const [entranceFee, setEntranceFee] = useState(0);
	const [numPlayers, setNumPlayers] = useState(0);
	const [recentWinner, setRecentWinner] = useState("");
	const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
	const chainId = parseInt(chainIdHex);

	const raffleAddress =
		chainId in contractAddresses ? contractAddresses[chainId][0] : null;

	const { runContractFunction: getEntranceFee } = useWeb3Contract({
		abi,
		contractAddress: raffleAddress,
		functionName: "getEntranceFee",
		params: {},
	});

	const { runContractFunction: getNumPlayers } = useWeb3Contract({
		abi,
		contractAddress: raffleAddress,
		functionName: "getNumPlayers",
		params: {},
	});

	const { runContractFunction: getRecentWinner } = useWeb3Contract({
		abi,
		contractAddress: raffleAddress,
		functionName: "getRecentWinner",
		params: {},
	});

	const {
		runContractFunction: enterRaffle,
		isLoading,
		isFetching,
	} = useWeb3Contract({
		abi,
		contractAddress: raffleAddress,
		functionName: "enterRaffle",
		params: {},
		msgValue: entranceFee,
	});

	async function handleSuccess(tx) {
		await tx.wait(1);
		handleNewNotification(tx);
		updateData();
	}

	function handleNewNotification(tx) {
		dispatch({
			type: "info",
			message: "Transaction Complete",
			title: "Transaction Notification",
			position: "topR",
			icon: "bell",
		});
	}

	async function handleEnterRaffle() {
		await enterRaffle({
			onSuccess: handleSuccess,
			onError: (error) => console.log(error),
		});
	}

	async function updateData() {
		const entranceFeeFromContract = await getEntranceFee();
		setEntranceFee(entranceFeeFromContract.toString());

		const numPlayersFromContract = await getNumPlayers();
		setNumPlayers(numPlayersFromContract.toString());

		const recentWinnerFromContract = await getRecentWinner();
		setRecentWinner(recentWinnerFromContract.toString());
	}

	useEffect(() => {
		if (isWeb3Enabled) {
			//Read raffle entrance fee
			updateData();
		}
	}, [isWeb3Enabled]);

	const {} = useWeb3Contract({
		abi,
		contractAddress: raffleAddress,
		functionName: "enterRaffle",
		params: {},
		msgValue: 0,
	});

	return (
		<div className="p-5">
			{raffleAddress ? (
				<>
					<br />
					<button
						className="bg-blue-500 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
						onClick={handleEnterRaffle}
						disabled={isLoading || isFetching}>
						{isLoading || isFetching ? (
							<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
						) : (
							<div>Enter Raffle</div>
						)}
					</button>
					<br />
					<br />
					Entrance Fee:{" "}
					{ethers.utils.formatUnits(entranceFee, "ether")} ETH
					<br />
					<br />
					Number of players: {numPlayers}
					<br />
					<br />
					Recent Winner: {recentWinner}
					<br />
				</>
			) : (
				<div>No Raffle contract</div>
			)}
		</div>
	);
}
