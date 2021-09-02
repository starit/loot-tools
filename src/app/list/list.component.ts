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
    ]
  }

}
