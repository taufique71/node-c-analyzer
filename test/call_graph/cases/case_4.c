int factorial(int n){
    if(n == 1) return 1;
    else return (n * factorial(n-1)); 
}

int add_factorial(int a, int b){
    return (factorial(a) + factorial(b));
}

int main(){
    printf("%d", add_factorial(2,3));
    return 0;
}
