int qmax = 100;

struct queue {
    char box[qmax+1];
    int front, rear;
}

void initialize(struct queue *q){
    q->front = 1;
    q->rear = 0;
}

void push(struct queue *q, char item){
    q->box[++q->rear] = item;
}

int pop(struct queue *q){
    return ++q->front;
}

int empty(struct queue *q){
    return(q->rear < q->front);
}

char top(struct queue *q){
    return q->box[q->front];
}