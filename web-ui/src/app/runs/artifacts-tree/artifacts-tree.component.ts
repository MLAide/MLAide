import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { Observable, Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import { downloadArtifact } from "@mlaide/state/artifact/artifact.actions";
import { Artifact } from "@mlaide/state/artifact/artifact.models";

/** File node data with possible child nodes. */
export interface FileNode {
  artifactFileId?: string;
  artifactName?: string;
  artifactVersion?: number;
  isDownloadable: boolean;
  name: string;
  type: string;
  children?: FileNode[];
}

/**
 * Flattened tree node that has been created from a FileNode through the flattener. Flattened
 * nodes include level index and whether they can be expanded or not.
 */
export interface FlatTreeNode {
  artifactFileId?: string;
  artifactName?: string;
  artifactVersion?: number;
  downloadable: boolean;
  name: string;
  type: string;
  level: number;
  expandable: boolean;
}

@Component({
  selector: "app-artifacts-tree",
  templateUrl: "./artifacts-tree.component.html",
  styleUrls: ["./artifacts-tree.component.scss"],
})
export class ArtifactsTreeComponent implements OnChanges, OnDestroy {
  @Input() public artifacts$: Observable<Artifact[]>;
  @Input() public projectKey: string;
  public artifactNodes: FileNode[] = [];
  private artifactsSubscription: Subscription;

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  public treeControl: FlatTreeControl<FlatTreeNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  public treeFlattener: MatTreeFlattener<FileNode, FlatTreeNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  public dataSource: MatTreeFlatDataSource<FileNode, FlatTreeNode>;

  constructor(private store: Store) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.artifacts$) {
      this.unsubscribeArtifacts();

      this.artifactsSubscription = this.artifacts$.subscribe((artifacts) => {
        this.artifactNodes = [];
        this.buildFileNodesAndAddToArtifactNodes(artifacts);
        if (this.artifactNodes) {
          this.sortTree(this.artifactNodes);
          this.dataSource.data = this.artifactNodes;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeArtifacts();
  }

  public download(node: FlatTreeNode) {
    this.store.dispatch(downloadArtifact({
      projectKey: this.projectKey,
      artifactName: node.artifactName,
      artifactVersion: node.artifactVersion,
      artifactFileId: node.artifactFileId
    }));
  }

  /** Get whether the node has children or not. */
  public hasChild(node: FlatTreeNode) {
    return node.expandable;
  }

  /** Transform the data to something the tree can read. */
  private transformer(node: FileNode, level: number) {
    return {
      artifactFileId: node.artifactFileId,
      artifactName: node.artifactName,
      artifactVersion: node.artifactVersion,
      downloadable: node.isDownloadable,
      name: node.name,
      type: node.type,
      level: level,
      expandable: !!node.children,
    };
  }

  /** Get the level of the node */
  private getLevel(node: FlatTreeNode) {
    return node.level;
  }

  /** Get whether the node is expanded or not. */
  private isExpandable(node: FlatTreeNode) {
    return node.expandable;
  }

  /** Get the children for the node. */
  private getChildren(node: FileNode): FileNode[] | null | undefined {
    return node.children;
  }

  private buildFileNodesAndAddToArtifactNodes(artifacts: Artifact[]) {
    let root: FileNode;
    artifacts?.forEach((artifact) => {
      root = {
        artifactName: artifact.name,
        artifactVersion: artifact.version,
        isDownloadable: true,
        name: artifact.name,
        type: "folder",
        children: [],
      };
      artifact.files?.forEach((file) => {
        const fileDir = ArtifactsTreeComponent.separateFileDir(file.fileName);
        let fileNode = root;

        fileDir?.forEach((fileDirPart, index, fileDirArray) => {
          if (index === fileDirArray.length - 1) {
            fileNode.children.push({
              artifactFileId: file.fileId,
              artifactName: artifact.name,
              artifactVersion: artifact.version,
              isDownloadable: true,
              name: fileDirPart,
              type: "file",
            });
          } else {
            let child: FileNode = this.checkIfChildNodeExists(fileDirPart, fileNode);

            if (child === undefined) {
              child = {
                isDownloadable: false,
                name: fileDirPart,
                type: "folder",
                children: [],
              };

              fileNode.children.push(child);
            }

            fileNode = child;
          }
        });
      });
      this.artifactNodes?.push(root);
    });
  }

  private static separateFileDir(fileDir: string): string[] {
    return fileDir.split("/");
  }

  private checkIfChildNodeExists(name: string, node: FileNode): FileNode {
    return node.children.find((child) => child.name === name);
  }

  private sortTree(artifactNodes: FileNode[]) {
    if (artifactNodes === undefined) {
      return;
    }

    artifactNodes.sort(ArtifactsTreeComponent.compare);

    artifactNodes.forEach((node) => {
      this.sortTree(node.children);
    });
  }

  private static compare(objectA: FileNode, objectB: FileNode) {
    /*
     * If one object is a folder and the other is not, the folder is sorted higher
     */
    if (objectA.type === "folder" && objectB.type !== "folder") {
      return -1;
    } else if (objectA.type !== "folder" && objectB.type === "folder") {
      return 1;
    }

    /*
     * If both objects are folders or files, they are sorted alphabetically
     */
    if (objectA.name < objectB.name) {
      return -1;
    } else if (objectA.name > objectB.name) {
      return 1;
    } else {
      return 0;
    }
  }

  private unsubscribeArtifacts() {
    if (this.artifactsSubscription) {
      this.artifactsSubscription.unsubscribe();
      this.artifactsSubscription = null;
    }
  }
}
