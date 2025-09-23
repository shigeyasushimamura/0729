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