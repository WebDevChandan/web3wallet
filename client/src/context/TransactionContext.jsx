        // We're going to use react context api around our entire application that's going to only serve the purpose of connecting to the blockchain that's going to allow us not to write our logic all accross all of our components, we're only going to write it in one centralized place and that's going to be in TransactionContext.jsx

        import React, { useEffect, useState } from 'react';
        import { ethers } from 'ethers';

        import { contractABI, contractAddress } from '../utils/constants';

        export const TransactionContext = React.createContext();

        // There's an entire ethereum object of window object, that going to allow us to handle our ethereum and blockchain relation. This object would only generate in such browser  installed metamask. 
        const { ethereum } = window;

        // fetch ethereum contract
        const getEthereumContract = () => { 
        const provider = new ethers.providers.Web3Provider(ethereum); 
        const signer = provider.getSigner();
        const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

        return transactionContract;
        }

        export const TransactionProvider = ({ children }) => {
        const [currentAccount, setCurrentAccount] = useState();

        //Created State Variables of Form from name attribute
        const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });

        const [isLoading, setsIsLoading] = useState(false);

        //Store TransacitonCount in localStore so that, We can always keep track of the current transactionCount 
        const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
  
        const [transactions, setTransactions] = useState([]);
            
        const handleChange = (e, name) => {
            setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
        }

        const getAllTransactions = async () => {
            try {
                if (!ethereum) return alert("Please install MetaMask");
                
                const transactionContract = getEthereumContract();
                
                const availableTransactions = await transactionContract.getAllTransactions();
                
                const structuredTransactions = availableTransactions.map((transaction) => ({
                    addressTo: transaction.receiver,
                    addressFrom: transaction.sender,
                    timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                    message: transaction.message,
                    keyword: transaction.keyword,
                    amount: parseInt(transaction.amount._hex) / (10 ** 18)
                        
                }))
                
                console.log(structuredTransactions);
                
                
                setTransactions(structuredTransactions);
            } catch (error) {
                console.log(error);
            }
        }

        //Function to Check the Wallet is Connected or Not at the start
        const checkIfWalletIsConnected = async () => {

            try {
                if (!ethereum) return alert("Please install MetaMask");
                
                const accounts = await ethereum.request({ method: 'eth_accounts' });
                
                if (accounts.length) {
                    setCurrentAccount(accounts[0]);

                    getAllTransactions();
                } else {
                    console.log('No accounts found');
                }
                
            } catch (error) {
                console.log(error);

                throw new Error("No Ethereum Object. ")
            }
        }

        //Function for connecting the connect with MetaMask
        const connectWallet = async () => {
            try {
                if (!ethereum) return alert("Please install MetaMask");

                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            
                setCurrentAccount(accounts[0]);
                window.location.reload();
            } catch (error) {
                console.log(error);

                throw new Error("No Ethereum Object. ");
        }
        }

        //Function to send Transactions
        const sendTransaction = async () => {
            try {
                if (!ethereum) return alert("Please install MetaMask");

                const { addressTo, amount, keyword, message } = formData;
                
                const transactionContract = getEthereumContract();

                //A way of converting user's amount into Hexadecimal or Gwei
                const parsedAmount = ethers.utils.parseEther(amount); //The 'ethers' package provide us the utility funciton that we can call a funciton and one of those utility function is called parseEther() function or method, which just parses the decimal amount into Gwei Hexadecimal amount.
                
                //Sending Ethereum from One Address to Another Address
                await ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: currentAccount,
                        to: addressTo,
                        gas: '0x5208', //In decimal = 21000, this going to be "2100 Gwei" which is the 'sub-units of Ethereum' but it actually an ether. So it would be, equal to 0.000021 ethereum. So, we've to write everything in Hexadecimal value that're going to converted into 'Gwei'. 
                        value: parsedAmount._hex, // Ex: 0.00001 (Chosen from the form)
                    }]
                });

                //Storing Ethereum Transaction
                const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
                //This would an asynchronous action that definitely takes some time for each transaction to go through.
                setsIsLoading(true);
                console.log(`Loading - ${transactionHash.hash}`);
                await transactionHash.wait();

                setsIsLoading(false);
                console.log(`Succes - ${transactionHash.hash}`);
                
                const transactionCount = await transactionContract.getTransactionCount();

                setTransactionCount(transactionCount.toNumber());
                
                window.reload()
            } catch (error) {
                console.log(error);

                throw new Error("No Ethereum Object. ");
            }
        }

        const checkIfTransactionsExist = async () => {
            try {
                const transactionContract = getEthereumContract();            
                const transactionCount = await transactionContract.getTransactionCount();
                window.localStorage.setItem("transactionCount", transactionCount);
            } catch (error) {
                console.log(error);

                throw new Error("No Ethereum Object. ");
            }
        }
        useEffect(() => {
            checkIfWalletIsConnected();
            checkIfTransactionsExist();
        }, []);
            
        return (
            //Context Value
            <TransactionContext.Provider value={{transactionCount, connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading}}>
                {children}
            </TransactionContext.Provider>
        );
        }
