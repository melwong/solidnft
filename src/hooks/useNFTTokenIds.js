import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useState } from "react";
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useIPFS } from "./useIPFS";

export const useNFTTokenIds = (addr) => {
  const { token } = useMoralisWeb3Api();
  const { chainId } = useMoralisDapp();
  const { resolveLink } = useIPFS();
  const [NFTTokenIds, setNFTTokenIds] = useState([]);
  const [totalNFTs, setTotalNFTs] = useState();
  const [fetchSuccess, setFetchSuccess] = useState(true);
  const {
    fetch: getNFTTokenIds,
    data,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(token.getAllTokenIds, {
    chain: chainId,
    address: addr,
    limit: 10,
  });

  useEffect(() => {
    async function fetchData() {
      if (data?.result) {
        const NFTs = data.result;
        setTotalNFTs(data.total);
        setFetchSuccess(true);
        for (let NFT of NFTs) {
          if (NFT?.metadata) {
            NFT.metadata = JSON.parse(NFT.metadata);
            NFT.image = resolveLink(NFT.metadata?.image);
          } else if (NFT?.token_uri) {
            try {
              await fetch(NFT.token_uri)
                .then((response) => response.json())
                .then((data) => {
                  NFT.image = resolveLink(data.image);

                  /*Mel: 17/01/22*/
                  NFT.itemName = data.name;
                  NFT.description = data.description;
                  NFT.type = data.attributes[0].value;
                  NFT.weight = data.attributes[1].value;
                  NFT.quantity = data.attributes[2].value;
                  NFT.purity = data.attributes[3].value;
                  NFT.dimension = data.attributes[4].value;
                  NFT.country = data.attributes[5].value;
                  NFT.serial_number = data.attributes[6].value;
                  NFT.brand = data.attributes[7].value;
                  NFT.custodian = data.attributes[8].value;
                  NFT.custodianId = data.attributes[9].value;
                  NFT.rating = data.attributes[10].value;
                  NFT.year = data.attributes[11].value;
                  NFT.style = data.attributes[12].value;
                  NFT.region = data.attributes[13].value;
                  NFT.location = data.attributes[14].value;
                  /*Mel: End*/

                });
            } catch (error) {
              setFetchSuccess(false);

              /*          !!Temporary work around to avoid CORS issues when retrieving NFT images!!
                          Create a proxy server as per https://dev.to/terieyenike/how-to-create-a-proxy-server-on-heroku-5b5c
                          Replace <your url here> with your proxy server_url below
                          Remove comments :)*/
              /*Mel: 18/01/22. Below does not work as it return Invalid Host error at https://fast-stream-93674.herokuapp.com/0xa5fdb0822bf82de3315f1766574547115e99016f on Chrome*/
              // try {
              //   await fetch(`https://fast-stream-93674.herokuapp.com/${NFT.token_uri}`, {
              //     headers: {
              //       'Content-Type': 'application/json'
              //     },
              //   })
              //     .then(response => response.json())
              //     .then(data => {
              //       NFT.image = resolveLink(data.image);
              //     });
              // } catch (error) {
              //   setFetchSuccess(false);
              // }


            }
          }
        }
        setNFTTokenIds(NFTs);
      }
    }
    fetchData();
  }, [data, resolveLink]);

  return {
    getNFTTokenIds,
    NFTTokenIds,
    totalNFTs,
    fetchSuccess,
    error,
    isLoading,
  };
};
