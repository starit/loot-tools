import IPFS from '../ipfs-mini';
import axios from 'axios';

export class IPFSHelper {
  ipfs: any;

  constructor(ipfsEndpoint: string) {
    this.ipfs = new IPFS({ host: ipfsEndpoint, protocol: 'https', base: '/api/v0' });
  }

  async getObjectFromIPFSOld(ipfsHash: string | null): Promise<any> {
    if (ipfsHash === null) {
      return null;
    }
    return new Promise((resolve, reject) => {
      this.ipfs.catJSON(ipfsHash, (err, result) => {
        if (err != null) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async getObjectFromIPFS(ipfsHash: string | null): Promise<any> {
    if (ipfsHash === null) {
      return null;
    }

    return new Promise((resolve, reject) => {
      axios.get('https://dweb.link/ipfs/' + ipfsHash)
        .then(function (response) {
          // handle success
          resolve(response.data);
        })
        .catch(function (error) {
          // handle error
          reject(error);
        })
    });
  }

  uploadObjectToIPFS(value: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.ipfs.addJSON(value, (err, result) => {
        if (err != null) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}