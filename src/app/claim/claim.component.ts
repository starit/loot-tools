import { Component, OnInit } from '@angular/core';
import { RemoteIPFSSearchTree } from '../../libs/ipfs-search-tree/remote-ipfs-search-tree';
import { ethers } from 'ethers';
import { ActivatedRoute } from '@angular/router';
import BigNumber from 'bignumber.js';
import { WalletService } from '../wallet.service';
import { ContractService } from '../contract.service';


const airdropList = [
  {
    name: 'AdventureGold Airdrop',
    contractAddress: '0x32353A6C91143bfd6C7d363B546e62a9A2489A20',
    tokenAddress: '0x32353A6C91143bfd6C7d363B546e62a9A2489A20',
    tokenSymbol: 'AGLD',
    tokenType: '20',
    airdropAmount: '10000',
    description: 'AdventureGold Airdrop for Loot Holder'
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
    this.airdropInfo = airdropList[0]
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

  async ngDoCheck(){
    if(this.wallet.userAddress && this.oldUserAddress !== this.wallet.userAddress){
      // this.triggerCheck()
    }
  }

  triggerCheck(){
    if(!this.wallet.userAddress){
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
    // const checksumAddress = ethers.utils.getAddress(address);
    const adventureGoldContract = this.contracts.getContract(this.airdropInfo.contractAddress, 'AdventureGold', web3)
  
    // const claim = await adventureGoldContract.methods.seasonClaimedByTokenId(0, checksumAddress).call()
    const claimed = await adventureGoldContract.methods.seasonClaimedByTokenId(0, lootId).call()
    this.claimed = claimed

    console.log('[getClaim] claimed', claimed)

    return !claimed
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
    // if (!this.userClaim) {
    //   this.errHint = 'The provided address is not included in this airdrop.'
    //   // this.wallet.displayGenericError(new Error());
    //   this.checking = false
    //   return;
    // }
    // 
    // const astrodropContract = this.contracts.getContract(this.remoteTree.metadata.contractAddress, 'Astrodrop', readonlyWeb3);
    // this.claimed = await astrodropContract.methods.isClaimed(this.userClaim.index).call();

    // const tokenAddress = this.remoteTree.metadata.tokenAddress;
    // const tokenContract = this.contracts.getERC20(tokenAddress, readonlyWeb3);
    // this.claimTokenSymbol = await tokenContract.methods.symbol().call();

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
    const adventureGoldContract = this.contracts.getContract(this.airdropInfo.contractAddress, 'AdventureGold')
    const func = adventureGoldContract.methods.claimById(lootId)

    this.wallet.sendTx(func, () => { }, () => { }, (error) => { this.wallet.displayGenericError(error) });
  }

  sweep() {
  }
}
