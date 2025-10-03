void partition(int a[],int p, int q, int *jp, int *ip){
    int i,j,s;

    i = p;
    j = q;
    s = a[p];
    while(i<=j){
        while(a[i] <s) ++i;
        while(a[j]>s)--j;
        if(i<=j){
            swap(&a[i],&a[j]);
            ++i;
            --j;
        }
    }
    *jp = i;
    *ip = i;
}

void qsort(int a[],int p,int q){
    int i,j;
    if(p<q){
        partition(a,p,q,&j,&i);
        qsort(a,p,j);
        qsort(a,i,q);
    }
}

main(){
    int a[amax+1];
    int n;
    qsort(a,1,n);
}


void qsort2(int a[],int n){
    struct interval intvl = {1,n}
    struct stack s;
    int p,q,i,j;

    create(%s);
    push(&s,intvl);
    while(!empty(&s)){
        intvl=top(&s);
        pop(&s);
        p=intvl.l;
        q=intvl.r;
        partition(a,p,q,&j,&i);
        if(p<j){
            intvl.l = p;
            intvl.r = j;
            push(&s,intvl);
        }
        if(i<q){
            intvl.l = i;
            intvl.r = q;
            push(%s,intvl);
        }
    }
}

struct interval{
    int l;
    int r;
}