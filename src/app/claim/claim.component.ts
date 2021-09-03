import { Component, OnInit } from '@angular/core';
import { RemoteIPFSSearchTree } from '../../libs/ipfs-search-tree/remote-ipfs-search-tree';
import { ethers } from 'ethers';
import { ActivatedRoute } from '@angular/router';
import BigNumber from 'bignumber.js';
import { WalletService } from '../wallet.service';
import { ContractService } from '../contract.service';


const airdropList = [
  {
    id: 1,
    name: 'AdventureGold Airdrop for Loot Holders',
    contractAddress: '0x32353A6C91143bfd6C7d363B546e62a9A2489A20',
    tokenAddress: '0x32353A6C91143bfd6C7d363B546e62a9A2489A20',
    tokenSymbol: 'AGLD',
    tokenType: '20',
    airdropAmount: '10000',
    description: 'AdventureGold Airdrop for Loot Holder'
  },
  {
    id: 2,
    name: 'LootRealm NFT Airdrop for Loot Holders',
    contractAddress: '0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d',
    tokenAddress: '0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d',
    tokenSymbol: 'LootRealm',
    tokenType: '721',
    airdropAmount: '1',
    description: 'Notice: this airdrop will charge 0.03 ETH as a fee. (Please use at your own risk)'
  },
  {
    id: 3,
    name: 'cLoot NFT Airdrop for Loot Holders',
    contractAddress: '0xEde64fefF210f406BFf709E2f375611641C2A945',
    tokenAddress: '0xEde64fefF210f406BFf709E2f375611641C2A945',
    tokenSymbol: 'cLoot',
    tokenType: '721',
    airdropAmount: '1',
    description: '1:1 NFT Airdrop to Loot Holders. More Details: https://cloot.org/'
  },
]
@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})
export class ClaimComponent implements OnInit {
  IPFS_ENDPOINT = 'ipfs.infura.io:5001';
  rootIPFSHash: string;
  airdropInfo: any;
  claimAddress: string;
  oldUserAddress: string;
  userClaim: any;
  checking: boolean;
  airdropBalance: BigNumber;
  claimableAmount: string;
  claimTokenSymbol: string;
  claimed: boolean;
  errHint: string;
  finishedLoadingRoot: boolean;
  finishedCheckingClaim: boolean;
  expirationTime: string;
  sweepEnabled: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    public wallet: WalletService,
    public contracts: ContractService
  ) { }

  async ngOnInit() {
    this.rootIPFSHash = this.activatedRoute.snapshot.paramMap.get('rootIPFSHash');
    const projectId = new BigNumber(this.rootIPFSHash).minus(1).toString()
    console.log('this.rootIPFSHash', this.rootIPFSHash)
    this.airdropInfo = airdropList[projectId]
    console.log('airdropInfo', this.airdropInfo)
    this.claimTokenSymbol = this.airdropInfo.tokenSymbol
    // const readonlyWeb3 = this.wallet.readonlyWeb3();
    // if (this.rootIPFSHash === 'QmfERE8NSgN57iUahH4yjn3tBXGUCk8GLK3yi7vbq1JWXZ') {
    //   const adventureGoldContract = this.contracts.getContract('0x32353A6C91143bfd6C7d363B546e62a9A2489A20', 'AdventureGold', readonlyWeb3)
    // }
    // const lootAirdropContract = this.contracts.getContract()
    const expireTimestamp = 0
    this.expirationTime = new Date(expireTimestamp).toUTCString();
    this.finishedLoadingRoot = true;

    this.errHint = ''

    // if(this.wallet.userAddress){
    //   this.triggerCheck()
    // }
  }

  async ngDoCheck() {
    if (this.wallet.userAddress && this.oldUserAddress !== this.wallet.userAddress) {
      // this.triggerCheck()
    }
  }

  triggerCheck() {
    if (!this.wallet.userAddress) {
      return
    }
    this.claimAddress = this.wallet.userAddress
    this.oldUserAddress = this.wallet.userAddress
    this.clickCheck()
  }

  resetData() {
    this.claimed = false;
    this.finishedCheckingClaim = false;
    this.finishedLoadingRoot = false;
  }

  clickCheck() {
    // if (!this.wallet.web3.utils.isAddress(this.claimAddress)) {
    //   this.errHint = 'The provided address is not a valid Ethereum address.'
    //   // this.wallet.displayGenericError(new Error(''));
    //   return;
    // }
    if (!this.isValidLootId(this.claimAddress)) {
      this.errHint = 'Please input a valid loot token id'
      return false
    }

    this.checkClaim(this.claimAddress);
  }

  clickClaim() {
    this.claimAirdrop(this.claimAddress, this.userClaim);
  }

  clickSweep() {
    this.sweep();
  }

  async getClaim(lootId: string, web3) {
    if (this.airdropInfo.id === 1) {
      const adventureGoldContract = this.contracts.getContract(this.airdropInfo.contractAddress, 'AdventureGold', web3)
      const claimed = await adventureGoldContract.methods.seasonClaimedByTokenId(0, lootId).call()
      this.claimed = claimed
      return !claimed
    } else if (this.airdropInfo.id === 2) {
      const contract = this.contracts.getContract(this.airdropInfo.contractAddress, 'LootRealm')
      let claimed = false;
      try {
        const gas = await contract.methods.mintWithLoot(lootId).estimateGas({ value: web3.utils.toWei('0.03'), from: this.wallet.userAddress })
      } catch (e) {
        claimed = true
        this.errHint = e.toString()
        console.error(e)
      }
      console.log('claimed', claimed)
      this.claimed = claimed
    } else if (this.airdropInfo.id === 3) {
      const contract = this.contracts.getContract(this.airdropInfo.contractAddress, 'CLoot')
      let claimed = false;
      try {
        const owner = await contract.methods.ownerOf(lootId).call()
        claimed = true
      } catch (e) {
        claimed = false
      }
      this.claimed = claimed
      console.log('claimed', claimed)
    }

    // const claim = await this.remoteTree.find(checksumAddress);
    // return claim;
  }

  isValidLootId(lootId: string) {
    return new BigNumber(lootId).isLessThanOrEqualTo(8000)
  }

  async checkClaim(lootId: string) {
    this.finishedCheckingClaim = false;
    this.checking = true
    this.errHint = ''

    const readonlyWeb3 = this.wallet.readonlyWeb3();



    this.userClaim = await this.getClaim(lootId, readonlyWeb3);

    if (!this.claimed) {
      // let tokenDecimals;
      // if (this.remoteTree.metadata.tokenType === '20') {
      //   tokenDecimals = +await tokenContract.methods.decimals().call();
      // } else if (this.remoteTree.metadata.tokenType === '721') {
      //   tokenDecimals = 0;
      // }
      // const tokenPrecision = new BigNumber(10).pow(tokenDecimals);
      // this.airdropBalance = new BigNumber(this.userClaim.amount, 16).div(tokenPrecision);
      // this.airdropBalance = new BigNumber(1);
      this.claimableAmount = this.airdropInfo.airdropAmount;
    }

    this.finishedCheckingClaim = true;
    this.checking = false

  }

  claimAirdrop(claimAddress: string, claim: any) {
    // if(claimAddress !== this.wallet.userAddress){
    //   this.errHint = 'Please use your own address to claim!'
    //   return false
    // }
    const lootId = claimAddress // temp hack
    if (!this.isValidLootId(lootId)) {
      this.errHint = 'Please input a valid loot id'
      return false
    }

    let func
    if (this.airdropInfo.id === 1) {
      const adventureGoldContract = this.contracts.getContract(this.airdropInfo.contractAddress, 'AdventureGold')
      func = adventureGoldContract.methods.claimById(lootId)
      this.wallet.sendTx(func, () => { }, () => { }, (error) => { this.wallet.displayGenericError(error) });
    } else if (this.airdropInfo.id === 2) {
      const contract = this.contracts.getContract(this.airdropInfo.contractAddress, 'LootRealm')
      func = contract.methods.mintWithLoot(lootId)
      const value = new BigNumber(0.03).shiftedBy(18).toString()
      console.log(value)
      this.wallet.sendTxWithValue(func, value, () => { }, () => { }, (error) => { this.wallet.displayGenericError(error) });
    } else if (this.airdropInfo.id === 3) {
      const contract = this.contracts.getContract(this.airdropInfo.contractAddress, 'CLoot')
      func = contract.methods.claim(lootId)
      this.wallet.sendTx(func, () => { }, () => { }, (error) => { this.wallet.displayGenericError(error) });
    }

    // this.wallet.sendTx(func, () => { }, () => { }, (error) => { this.wallet.displayGenericError(error) });
  }

  sweep() {
  }
}
function elseif(arg0: boolean) {
  throw new Error('Function not implemented.');
}

