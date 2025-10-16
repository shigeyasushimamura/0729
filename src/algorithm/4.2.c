struct vertex {
    int data;
    struct vertex *l,*r;
}

struct vertex *newv(){
    return((struct vertex *)malloc(sizeof(struct vertex)));

}

struct vertex *create(){
    struct vertex *p;
    p = newv();
    p->data = 0;
    p->r = NULL;
    p->l = NULL;
    return(p);
}

int member(struct vertex *p, int x){
    if(p->data == x){
        return 1;
    }else if(p->data > x && p->l != NULL){
        return member(p->l,x);
    }else if(p->data < x && p->r != NULL){
        return member(p->r,x);
    }
    return 0;
}

void insert(struct vertex *p, int x){
    struct vertex *pt;
    if(p->data >x && p->l != NULL){
        return insert(p->l,x);
    }else if(p->data < x && p->r != NULL){
        return insert(p->r, x);
    }
    pt = newv();
    pt->data = x;
    pt->l = pt->r = NULL;
    if(p->data > x){
        p->l = pt;
    }else {
        p->r = pt;
    }

}

void deleteb(struct vertex *p, int x){
    struct vertex *f, *q;

    do{
        f=p;
        if(x<p->data)
            p = p->l;
        else 
            p = p->r;

    }while(p != NULL && x != p->data);
    // このwhileループ抜けた時、fはpの親。
    if(p == NULL){
        return;
    }
    // この時点でpはxをdataにもつ。つまりpは削除対象
    if(p->l == NULL || p->r == NULL){
        if(p->r == NULL){
            q = p->l;
        }else {
            q = p -> r;
        }
        if(f->l==p){
            f->l = q;
        }else {
            f->r = q;
        }
    }else {
        q = p->r;
        f = q;
        while(q->l != NULL){
            f = q;
            q = q->l;
        }
        p->data = q->data;
        if(q==f){
            p->r = q->r;
        }else {
            f->l = q->r;
        }
    }
}