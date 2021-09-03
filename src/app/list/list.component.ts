import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  projectList: object[];

  constructor() { }

  ngOnInit(): void {
    this.projectList = [
      {
        token: 'pickle.png',
        name: 'AdventureGold Airdrop',
        address: '1',
        contractAddress: '0x32353A6C91143bfd6C7d363B546e62a9A2489A20',
      },
      {
        token: 'pickle.png',
        name: 'LootRealms Airdrop',
        address: '2',
        contractAddress: '0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d',
      },
      {
        token: 'pickle.png',
        name: 'cLoot Airdrop',
        address: '3',
        contractAddress: '0xEde64fefF210f406BFf709E2f375611641C2A945',
      }
    ]
  }

}
