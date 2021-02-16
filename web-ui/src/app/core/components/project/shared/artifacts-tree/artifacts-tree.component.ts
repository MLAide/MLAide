import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { ArtifactsApiService, ListDataSource } from "src/app/core/services";
import { Observable, Subscription } from "rxjs";
import {
  Artifact,
  ArtifactListResponse,
} from "src/app/core/models/artifact.model";
import { HttpResponse } from "@angular/common/http";
import { FileSaverService } from "ngx-filesaver";

/** File node data with possible child nodes. */
export interface FileNode {
  artifactFileId?: string;
  artifactName?: string;
  artifactVersion?: number;
  isDownlodable: boolean;
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
export class ArtifactsTreeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() artifactListDataSource: ListDataSource<ArtifactListResponse>;
  private artifactListSubscription: Subscription;
  @Input() projectKey: string;
  public artifactNodes: FileNode[] = [];

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatTreeNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  treeFlattener: MatTreeFlattener<FileNode, FlatTreeNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<FileNode, FlatTreeNode>;

  constructor(
    private artifactsApiService: ArtifactsApiService,
    private fileSaverService: FileSaverService
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );

    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.artifactListDataSource) {
      if (this.artifactListSubscription) {
        this.artifactListSubscription.unsubscribe();
      }

      this.artifactListSubscription = this.artifactListDataSource?.items$.subscribe(
        (artifacts) => {
          this.buildFileNodes(artifacts?.items);
          if (this.artifactNodes) {
            this.sortTree(this.artifactNodes);
            this.dataSource.data = this.artifactNodes;
          }
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.artifactListSubscription) {
      this.artifactListSubscription.unsubscribe();
      this.artifactListSubscription = null;
    }
  }

  public download(node: FlatTreeNode) {
    let observable: Observable<HttpResponse<ArrayBuffer>>;

    if (node.artifactFileId) {
      observable = this.artifactsApiService.download(
        this.projectKey,
        node.artifactName,
        node.artifactVersion,
        node.artifactFileId
      );
    } else {
      observable = this.artifactsApiService.download(
        this.projectKey,
        node.artifactName,
        node.artifactVersion
      );
    }

    observable.subscribe((response: any) => {
      const blob = new Blob([response], {
        type: response.headers.get("Content-Type"),
      });
      const contentDisposition: string = response.headers.get(
        "Content-Disposition"
      );
      // https://stackoverflow.com/questions/23054475/javascript-regex-for-extracting-filename-from-content-disposition-header/23054920
      const regEx = new RegExp(
        /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/gi
      );

      const fileName = regEx.exec(contentDisposition)[1];
      this.fileSaverService.save(blob, fileName);
    });
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
      downloadable: node.isDownlodable,
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

  private buildFileNodes(artifacts: Artifact[]) {
    let root: FileNode;
    artifacts?.forEach((artifact) => {
      root = {
        artifactName: artifact.name,
        artifactVersion: artifact.version,
        isDownlodable: true,
        name: artifact.name,
        type: "folder",
        children: [],
      };
      artifact.files?.forEach((file) => {
        const fileDir = this.separateFileDir(file.fileName);
        let fileNode = root;

        fileDir?.forEach((fileDirPart, index, fileDirArray) => {
          if (index === fileDirArray.length - 1) {
            fileNode.children.push({
              artifactFileId: file.fileId,
              artifactName: artifact.name,
              artifactVersion: artifact.version,
              isDownlodable: true,
              name: fileDirPart,
              type: "file",
            });
          } else {
            let child: FileNode = this.checkIfChildNodeExists(
              fileDirPart,
              fileNode
            );

            if (child === undefined) {
              child = {
                isDownlodable: false,
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

  private separateFileDir(fileDir: string): string[] {
    return fileDir.split("/");
  }

  private checkIfChildNodeExists(name: string, node: FileNode): FileNode {
    return node.children.find((child) => child.name === name);
  }

  private sortTree(artifactNodes: FileNode[]) {
    if (artifactNodes === undefined) {
      return;
    }

    artifactNodes.sort(this.compare);

    artifactNodes.forEach((node) => {
      this.sortTree(node.children);
    });
  }

  private compare(objectA: FileNode, objectB: FileNode) {
    /*
     * If one object is a folder and the other is not, the folder is sorted higher
     */
    if (objectA.type === "folder" && objectB.type !== "folder") {
      return -1;
    } else if (objectA.type !== "folder" && objectB.type === "folder") {
      return 1;
    }

    /*
     * If both objects are folders or files, they are sorted alphabeticaly
     */
    if (objectA.name < objectB.name) {
      return -1;
    } else if (objectA.name > objectB.name) {
      return 1;
    } else {
      return 0;
    }
  }
}
