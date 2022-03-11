import "./App.css";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import abi from "./utils/WishList.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [wish, setWish] = useState("");
  const [wishListContract, setWishListContract] = useState(false);
  const [wisherAddress, setWisherAddress] = useState(false);
  const [wishList, setWishList] = useState([]);

  const contractAddress = "0xf03e01514e88D012d7B163BA8C10D56036F0fdDC";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const _wishListContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        setWishListContract(_wishListContract);

        let myAddress = await signer.getAddress();
        console.log("provider signer...", myAddress);
        setWisherAddress(myAddress);

        console.log("Account Connected: ", account);
      } else {
        console.log("Please install a MetaMask wallet.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }, [contractABI]);

  const handleInputChange = (event) => {
    setWish(event.target.value);
  };

  const handleWishSubmission = async () => {
    if (!wish) {
      alert("Please write some wish first");
      return false;
    }

    const txn = await wishListContract.addWish(wish);
    console.log("Writing Wish...");
    await txn.wait();
    console.log("Wish Written...done", txn.hash);
    setWish("");
  };

  const getAllWishes = useCallback(async () => {
    if (wishListContract) {
      // Fetch existing Wish List
      console.log("Getting All Wishes...");
      const response = await wishListContract.getWishes();
      // let response = await txn.wait();
      let _wishList = [];
      response.map((_wish) => {
        _wishList.push({
          message: _wish.message,
          creator_address: _wish.creator_address,
          created_at: _wish.created_at.toNumber(),
        });
        return true;
      });
      setWishList(_wishList);
    }
  }, [wishListContract]);

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWishes();
    // eslint-disable-next-line
  }, []);

  const WishAddeddEvent = (_wish) => {
    console.log(_wish);
    let _wishObj = {
      message: _wish.message,
      creator_address: _wish.creator_address,
      created_at: _wish.created_at.toNumber(),
    };
    setWishList((w) => [...w, _wishObj]);
  };

  useEffect(() => {
    if (wishListContract) {
      wishListContract.on("WishAdded", WishAddeddEvent);
    }

    return () => {
      if (wishListContract) {
        wishListContract.off("WishAdded", WishAddeddEvent);
      }
    };
  }, [wishListContract]);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Do a Wish!!</h2>
        <button className="btn-connect" onClick={checkIfWalletIsConnected}>
          {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
        </button>
        {isWalletConnected && (
          <>
            <p>
              <span className="font-bold">Your Wallet Address: </span>
              {wisherAddress}
            </p>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                name="wish"
                value={wish}
                placeholder="Type Your Wish..."
                onChange={handleInputChange}
              />
              <button type="button" onClick={handleWishSubmission}>
                Submit
              </button>
            </div>
          </>
        )}
      </header>
      <div>
        <div className="wish-container">
          {wishList.map((wish, i) => {
            console.log(wish);
            return (
              <p className="wish" key={`${i}`}>
                <strong>Wish: </strong>"{wish.message}" <br />
                <strong>by</strong> <i>{wish.creator_address}</i>
                <br />
                <strong>Made On: </strong>
                <span>{new Date(wish.created_at * 1000).toLocaleString()}</span>
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
