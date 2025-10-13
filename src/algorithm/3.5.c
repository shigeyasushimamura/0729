int hmax = 100;
struct heap {
    int box[hmax+1];
    int size;
}

void swap(int *u,int *v){
    int temp;

    temp = *u;
    *u = *v;
    *v = temp;
}

void initialize(struct heap *h){
    h->size = 0;
}

void insert(struct heap *h, int item){
    int i;

    i = ++h->size;
    h->box[i] = item;
    while(i>1 && h->box[i] < h->box[i/2]){
        swap(&h->box[i], &h->box[i/2]);
        i /= 2;
    }
}

int findmin(struct heap *h){
    return h->box[1];
}

void deletemin(struct heap *h){
    int i,k;

    i = 1;
    h->box[1] = h->box[h->size];
    --h->size;
    while(2*i <= h->size){
        k = 2 * i;
        if(k < h->size && h->box[k] > h->box[K+1]){
            k++;
        }
        if(h->box[i] <= h->box[k]){
            break;
        }
       swap(&h->box[i], &h->box[k]);
       i = k;
    }
}


void heapsort(int a[],int n){
    struct heap h;
    int i;

    create(&h);
    for(i=1;i<=n;i++)
        insert(&h,a[i])
    for(i=1;i<=n;i++){
        a[i] = findmin(&h);
        deletemin(&h);
    }
}



void heapify(int a[], int i,int j){
    int k;

    k = 2 * i;
    if( k <= j){
        if( k != j && a[k] > a[k+1])
            k++;
        if(a[i] > a[k]){
            swap(&a[i],&a[k]);
            heapify(a,k,j);
        }
    }
}

void makeheap(int a[], int n){
    int i;
    for(i=n;1<=i;i--){
        heapify(a,i,n);
    }
}

void heapsort2(int a[],int n){
    int i;
    makeheap(a,n); // (1) 配列をヒープにする
    for(i=n;2<=i;i--){
        swap(&a[1],&a[i]); // (2) 根(最大値)と末尾を交換
        heapify(a,1,i-1);  // (3) 根からヒープを再調整
    }
}
