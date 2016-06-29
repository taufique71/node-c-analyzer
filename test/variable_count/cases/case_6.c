int main(){
    int a = 1, b = 2;
    b = a ^ b;
    a = b ^ a;
    b = b ^ a;
    return 0;
}
