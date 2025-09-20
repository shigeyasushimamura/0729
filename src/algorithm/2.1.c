struct element *new(){
    return ((struct element*)malloc(sizeof(struct element)))
}

struct element *create(){
    struct element *p;
    p = new();
    p->next = NULL;
    return(p);
}

void insert(struct element *l,int k, char item){
    struct element *p;

    if(k>1){
        insert(l->next, k-1, item);
    }else {
        p = new();
        p->data = item;
        p->next = l->next;
        l->next = p;
    }
}

void delete(struct element *l, int k){
    if(k>1){
        delete(l->next, k-1)
    }else {
        l->next = l->next->next
    }
}


char access(struct element *l, int k){
    if(k>1){
        return(access(l->next, k-1))
    }else {
        return(l->next->data)
    }
}