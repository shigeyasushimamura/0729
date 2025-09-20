struct stack {
    char box[smax+1]
    int top;
}

void initialize(struct stack *s){
    s->top = 0;
}

void push(struct stack *s, cahr item){
    s->box[++s->top] = item;
}


void pop(struct stack *s){
    --s -> top;
}

int empty(struct stack *s){
    return(s->top = 0);
}

char top(struct stack *s){
    return(s->box[s->top]);
}