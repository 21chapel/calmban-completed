import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {map, tap} from 'rxjs/operators';
import { CalmTask } from './task-card/task-card.component';

export interface CalmProject {
  id: string;
  name: string;
  mission: string;
}

export interface CalmCollaborator {
  role: 'editor' | 'admin';
}

interface TaskHash {
  [key: string]: CalmTask[]

}

@Component({
  selector: 'calm-project',
  templateUrl: './project.component.html',
  styles: [
    `calm-task-column:nth-child(odd) {
      background-color: #E6E6E6;
    }`,
    `calm-task-column {
      background-color: #F5F5F5;
      border-radius: 6px;
    }`
  ]
})
export class ProjectComponent implements OnInit {

  tasks: CalmTask[] = [
    {
      title: "someTitle",
      category: "someCategory",
      userId: "someID",
      photoURL: "somePhotoURL"
    },
    {
      title: "someTitle2",
      category: "someCategory2",
      userId: "someID2",
      photoURL: "somePhotoURL2"
    },
  ];

  tasks$: Observable<CalmTask[]>;
  hash$: Observable<TaskHash>;
  tasksCol: AngularFirestoreCollection<CalmTask>;

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore
  ) { }

  ngOnInit() { 
    const projectId = this.route.snapshot.params.projectId;
    this.tasksCol = this.afs.collection('projects').doc(projectId).collection('tasks');
    this.hash$ = this.tasksCol
        .valueChanges({idField: 'id'}) // snapshot changes brings a whole lot more information
        .pipe(
            map(tasks => {
              const hashTest2 = {};
              const hashTest = {
                'inProgress': [{
                  'category': 'inProgress',
                  'photoURL': 'URL1',
                  'title': 'understand tutorial',
                  'userId': 'always Fake'
                }, {
                  'category': 'inProgress',
                  'photoURL': 'URL2',
                  'title': 'drag n drop',
                  'userId': 'always Fake'
                }],
                'notStarted': [{
                  'category': 'notStarted',
                  'photoURL': 'URL3',
                  'title': 'assigning tasks',
                  'userId': 'always Fake'
                }, {
                  'category': 'notStarted',
                  'photoURL': 'URL4',
                  'title': 'talk to jos',
                  'userId': 'always Fake'
                }, {
                  'category': 'notStarted',
                  'photoURL': 'URL5',
                  'title': 'talk to steve',
                  'userId': 'always Fake'
                }],

              };
              const hash = {};

              tasks.forEach(task => {
                hash[task.category] = hash[task.category] || [];
                hash[task.category] = [...hash[task.category], task]; // if not?
              })

              return hash;
            })
        )
  }

  onNewTask(title: string) {
    
  }

  drop(event: CdkDragDrop<CalmTask[]>) {
    if(event.previousContainer !== event.container) {
      const transferringItem = event.previousContainer.data[event.previousIndex];
      const category = event.container.id;
      this.tasksCol.doc(transferringItem.id).update({ category });
    }
  }
  
}
