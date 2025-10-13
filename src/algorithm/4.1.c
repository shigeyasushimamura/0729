int member(int a[],int n, int x){
    int m,l,r;

    l = 1;
    r = n;
    do{
        m = (1+r)/2;
        if(x<a[m])
            r = m-1
        else 
            l = m + 1;
    }while(1<=r && x != a[m]);
    return(x == a[m]);
}