#include <string.h>

struct book{
    int id;
    char title[50];
    char author[50];
};

int main(){
    struct book b;
    b.i = 1;
    strcpy(b.title, "Harry Potter and The Sorcerer's Stone");
    strcpy(b.author, "J. K. Rowling");
    return 0;
}
