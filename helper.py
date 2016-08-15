with open('d:/temp/1.txt', 'r') as f:
    input = set(map(lambda l: l.replace('\n', ''), f.readlines()))
    print input
