import sqlite3
conn = sqlite3.connect('gastrohotel.db')
cur = conn.cursor()

# Asignar codigos correctos a articulos existentes por categoria
cur.execute("SELECT id_articulo, nombre, categoria FROM articulos ORDER BY categoria, id_articulo")
articulos = cur.fetchall()
cat_counters = {}
prefixes = {'Fuertes': 'RES', 'Bebidas': 'BEB', 'Entradas': 'ENT', 'Postres': 'POS'}
for (ida, nombre, cat) in articulos:
    prefix = prefixes.get(cat, 'ART')
    cat_counters[cat] = cat_counters.get(cat, 0) + 1
    codigo = f'{prefix}-{str(cat_counters[cat]).zfill(3)}'
    cur.execute('UPDATE articulos SET codigo = ? WHERE id_articulo = ?', (codigo, ida))
    print(f'Articulo {ida} ({nombre}) -> {codigo}')

conn.commit()
conn.close()
print('Codigos asignados correctamente.')
