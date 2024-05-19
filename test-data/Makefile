FLAGS := --books books.csv --config books.conf --content-dir=. --user-data ./user-data --verbose --headless=no --keep-open

BIN = node --loader ts-node/esm ../src/index.ts

dryrun:
	$(BIN) $(FLAGS) --dry-run

run:
	$(BIN) $(FLAGS)

book-Abby.pdf: book.tex
	pdflatex -jobname book-Abby "\def\MyName{Abby}\input{book.tex}"

cover-Abby.pdf: cover.tex
	pdflatex -jobname cover-Abby "\def\MyName{Abby}\input{cover.tex}"

book-Amy.pdf: book.tex
	pdflatex -jobname book-Amy "\def\MyName{Amy}\input{book.tex}"

cover-Amy.pdf: cover.tex
	pdflatex -jobname cover-Amy "\def\MyName{Amy}\input{cover.tex}"

book-Bobby.pdf: book.tex
	pdflatex -jobname book-Bobby "\def\MyName{Bobby}\input{book.tex}"

cover-Bobby.pdf: cover.tex
	pdflatex -jobname cover-Bobby "\def\MyName{Bobby}\input{cover.tex}"

book-Zenu.pdf: book.tex
	pdflatex -jobname book-Zenu "\def\MyName{Zenu}\input{book.tex}"

cover-Zenu.pdf: cover.tex
	pdflatex -jobname cover-Zenu "\def\MyName{Zenu}\input{cover.tex}"

clean:
	rm -fr *.aux *.log

cleanall: clean
	rm -fr *.pdf
