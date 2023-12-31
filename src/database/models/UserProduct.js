module.exports = (sequelize, DataTypes) => {
  
    const UserProduct = sequelize.define('UserProduct', {
      id: {
          type: DataTypes.INTEGER(11),
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
      },
      productId: {
          type: DataTypes.INTEGER(11),
          allowNull: false,
          references: {
            model: 'Product', // Nombre de la tabla a la que hace referencia
            key: 'id' // Nombre de la columna a la que hace referencia
          }
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
          model: 'User', // Nombre de la tabla a la que hace referencia
          key: 'id' // Nombre de la columna a la que hace referencia
        }
      },
      amount: {
        type: DataTypes.INTEGER(11),
        allowNull: false
      },
      dateBuy: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'users_products', 
      timestamps: false,
   })

   UserProduct.associate = (models)=> {

    UserProduct.belongsTo(models.Product, { 
     foreignKey: 'productId' 
   });
    }
  
   return UserProduct;
}