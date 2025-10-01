void merge(int a[], int b[], int p, int n){
    int i,j,k,h;

    h = n/2;
    i = p;
    j = p + h;

    // k:統合後の配列のindex
    for(k=p;k<p+n;k++)
        // 後半の配列インデックスjがmax OR 前半の配列インデックスiがmaxでなく、前半の配列要素 <= 後半の配列要素のとき
        if(j==p+n || (i <p+h && a[i] <= a[j]))
            b[k] = a[i++];
        else
            b[k] = a[j++];
    for (k=p;i<p+n;k++){
        a[k] = b[k];
    }
}

void msort(int a[], int b[], int p, int n){
    int h;

    if(n>1){
        h = n/2;
        msort(a,b,p,h);
        msort(a,b,p+h,n-h);
        merge(a,b,p,n);
    }
}

main(){
    int a[amax+1];
    int b[amax+1];
    int n;

    msort(a,b,1,n);
}