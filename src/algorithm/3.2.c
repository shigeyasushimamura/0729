void insertionsort(int a[], int n){
    int i,j,temp;

    for(i=2;i<=n;i++){
        temp = a[i];
        j= i;
        while(j>1&& a[i] > temp){
            a[j] = a[j-1];
            j = j-1;
        }
        a[j] = temp;
    }
}

void swap(int *x, int *y){
    int temp = *x;
    *x = *y;
    *y = temp;
}


void bubblesort(int a[],int n){
    int i,j,sorted;
    j=n;
    do {
        sorted = 1;
        j = j-1;
        for(i=1;i<=j;i++){
            if(a[i]> a[i+1]){
                swap(&a[i], &a[i+1]);
                sorted = 0
            }
        }
    }while(!sorted);
}