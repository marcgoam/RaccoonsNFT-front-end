import { abi } from "../constants/abi.json"
import {contractAddresses} from "../constants/contractAddresses.json"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"

export default function MintNFT() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)

    //const NFTAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    
    // State hooks
    const [mintFee, setMintFee] = useState("0")
    const [totalNFT, setTotalNFT] = useState("0")
    const [mintedNFT, setMintedNFT] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: requestNFT,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: NFTAddress,
        functionName: "requestNFT",
        msgValue: mintFee,
        params: {},
    })

    /* View Functions */
    const { runContractFunction: getMintFee } = useWeb3Contract({
        abi: abi,
        contractAddress: NFTAddress, // specify the networkId
        functionName: "getMintFee",
        params: {},
    })

    const { runContractFunction: getTotalNFT } = useWeb3Contract({
        abi: abi,
        contractAddress: NFTAddress, // specify the networkId
        functionName: "getTotalNFT",
        params: {},
    })

    const { runContractFunction: getMintedNFT } = useWeb3Contract({
        abi: abi,
        contractAddress: NFTAddress, // specify the networkId
        functionName: "getMintedNFT",
        params: {},
    })
    
    async function updateUIValues() {
        const mintFeeFromCall = (await getMintFee()).toString()
        const totalNFTFromCall = (await getTotalNFT()).toString()
        const mintedNFTFromCall = await getMintedNFT()
        setMintFee(mintFeeFromCall)
        setTotalNFT(totalNFTFromCall)
        setMintedNFT(mintedNFTFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    return(
        <div>
            {NFTAddress ? (
              <>
                <button onClick={async () => await requestNFT({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
                })  
            } 
                disabled={isLoading || isFetching}
            >
                {isLoading || isFetching ? (
                    <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                ) : (
                    "Enter Raffle"
            )}</button>
                <div>Mint Fee: {ethers.utils.formatUnits(mintFee, "ether")} ETH</div>
                <div>There are : { totalNFT - mintedNFT } / {totalNFT}</div>
              </>  
            ) : (
                <div>Please connect to a supported chain </div>
            )}
            
            
        </div>
        
    );
}
    