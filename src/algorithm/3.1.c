struct queue {
    char box[qmax+1];
    int front, rear;
}

void initialize(struct queur *q){
    q->front = 1;
    q->rear = 0;
}

void insert(struct queue *q, char item){
    q->box[++q->rear] = item;
}

void delete(struct queue *q){
    ++q->front;
}

int empty(struct queue *q){
    return(q->rear < q->front);
}

char top(struct queu *q){
    return(q->box[q->front]);
}

struct queue q[m+1];

void qtoa(struct queue *q, int a[]){
    static int j;
    while(!empty(q)){
        a[++j] = top(q);
        delete(q);
    }
}

void bucketsort(int a[], int n){
    int i;
    for(i=1;i<=m;i++){
        initialize(&q[i]);
    }
    for(i=1;i<=n;i++){
        insert(&q[a[i]],a[i])
    }
    for(i=1;i<=m;i++){
        qtoa(&q[i],a);
    }
}

void swap(int *u, int *v) {
    int temp;
    temp = *u;
    *u = *v;
    *v = temp;
}

void selectionsort(int a[], int n) {
    int i, j, min;

    for (j = 0; j < n - 1; j++) {
        min = j;
        for (i = j + 1; i < n; i++) {
            if (a[i] < a[min]) {
                min = i;
            }
        }
        // ループが終わったら swap
        if (min != j) {
            swap(&a[j], &a[min]);
        }
    }
}
