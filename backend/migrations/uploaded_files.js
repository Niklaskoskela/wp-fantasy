exports.up = function(knex) {
    return knex.schema.createTable('uploaded_files', function(table) {
      table.increments('id').primary();
      table.text('filename').notNullable();
      table.text('path').notNullable();
      table.integer('matchday_id')
        .unsigned()
        .references('id')
        .inTable('matchdays')
        .onDelete('CASCADE');
      table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('uploaded_files');
  };
  