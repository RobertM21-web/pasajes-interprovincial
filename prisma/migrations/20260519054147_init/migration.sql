BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[roles] (
    [id] NVARCHAR(1000) NOT NULL,
    [nombre] NVARCHAR(30) NOT NULL,
    [descripcion] NVARCHAR(200),
    [activo] BIT NOT NULL CONSTRAINT [roles_activo_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [roles_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [roles_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [roles_nombre_key] UNIQUE NONCLUSTERED ([nombre])
);

-- CreateTable
CREATE TABLE [dbo].[permisos] (
    [id] NVARCHAR(1000) NOT NULL,
    [clave] NVARCHAR(50) NOT NULL,
    [nombre] NVARCHAR(100) NOT NULL,
    [descripcion] NVARCHAR(200),
    [modulo] NVARCHAR(30) NOT NULL,
    CONSTRAINT [permisos_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [permisos_clave_key] UNIQUE NONCLUSTERED ([clave])
);

-- CreateTable
CREATE TABLE [dbo].[roles_permisos] (
    [id] NVARCHAR(1000) NOT NULL,
    [rol_id] NVARCHAR(1000) NOT NULL,
    [permiso_id] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [roles_permisos_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [roles_permisos_rol_id_permiso_id_key] UNIQUE NONCLUSTERED ([rol_id],[permiso_id])
);

-- CreateTable
CREATE TABLE [dbo].[usuarios] (
    [id] NVARCHAR(1000) NOT NULL,
    [nombre] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(150) NOT NULL,
    [password_hash] NVARCHAR(255) NOT NULL,
    [cedula] NVARCHAR(13),
    [telefono] NVARCHAR(15),
    [rol_id] NVARCHAR(1000) NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [usuarios_activo_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [usuarios_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [usuarios_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [usuarios_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [usuarios_cedula_key] UNIQUE NONCLUSTERED ([cedula])
);

-- CreateTable
CREATE TABLE [dbo].[configuracion] (
    [id] NVARCHAR(1000) NOT NULL,
    [nombre_cooperativa] NVARCHAR(150) NOT NULL,
    [logo_url] NVARCHAR(500),
    [color_primario] NVARCHAR(7),
    [color_secundario] NVARCHAR(7),
    [facebook] NVARCHAR(255),
    [instagram] NVARCHAR(255),
    [twitter] NVARCHAR(255),
    [whatsapp] NVARCHAR(20),
    [email_soporte] NVARCHAR(150),
    [telefono_soporte] NVARCHAR(20),
    [direccion] NVARCHAR(255),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [configuracion_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [configuracion_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[buses] (
    [id] NVARCHAR(1000) NOT NULL,
    [numero] NVARCHAR(10) NOT NULL,
    [placa] NVARCHAR(10) NOT NULL,
    [marca_chasis] NVARCHAR(50) NOT NULL,
    [marca_carroceria] NVARCHAR(50) NOT NULL,
    [fotografia_url] NVARCHAR(500),
    [total_asientos] INT NOT NULL,
    [activo] BIT NOT NULL CONSTRAINT [buses_activo_df] DEFAULT 1,
    [en_terminal] BIT NOT NULL CONSTRAINT [buses_en_terminal_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [buses_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [buses_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [buses_numero_key] UNIQUE NONCLUSTERED ([numero]),
    CONSTRAINT [buses_placa_key] UNIQUE NONCLUSTERED ([placa])
);

-- CreateTable
CREATE TABLE [dbo].[categorias_asiento] (
    [id] NVARCHAR(1000) NOT NULL,
    [bus_id] NVARCHAR(1000) NOT NULL,
    [nombre] NVARCHAR(50) NOT NULL,
    [precio_base] DECIMAL(10,2) NOT NULL,
    [cantidad] INT NOT NULL,
    [descripcion] NVARCHAR(200),
    CONSTRAINT [categorias_asiento_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[asientos] (
    [id] NVARCHAR(1000) NOT NULL,
    [categoria_id] NVARCHAR(1000) NOT NULL,
    [numero] INT NOT NULL,
    [fila] INT NOT NULL,
    [posicion] NVARCHAR(10) NOT NULL,
    [etiqueta] NVARCHAR(5) NOT NULL,
    CONSTRAINT [asientos_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [asientos_categoria_id_numero_key] UNIQUE NONCLUSTERED ([categoria_id],[numero])
);

-- CreateTable
CREATE TABLE [dbo].[frecuencias] (
    [id] NVARCHAR(1000) NOT NULL,
    [ciudad_origen] NVARCHAR(100) NOT NULL,
    [ciudad_destino] NVARCHAR(100) NOT NULL,
    [hora] NVARCHAR(5) NOT NULL,
    [resolucion_ant] NVARCHAR(100),
    [es_directa] BIT NOT NULL CONSTRAINT [frecuencias_es_directa_df] DEFAULT 0,
    [activa] BIT NOT NULL CONSTRAINT [frecuencias_activa_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [frecuencias_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [frecuencias_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[paradas_intermedias] (
    [id] NVARCHAR(1000) NOT NULL,
    [frecuencia_id] NVARCHAR(1000) NOT NULL,
    [ciudad] NVARCHAR(100) NOT NULL,
    [orden] INT NOT NULL,
    [precio_tramo] DECIMAL(10,2) NOT NULL,
    [tiempo_estimado] INT,
    CONSTRAINT [paradas_intermedias_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [paradas_intermedias_frecuencia_id_orden_key] UNIQUE NONCLUSTERED ([frecuencia_id],[orden])
);

-- CreateTable
CREATE TABLE [dbo].[hojas_ruta] (
    [id] NVARCHAR(1000) NOT NULL,
    [oficinista_id] NVARCHAR(1000) NOT NULL,
    [fecha_inicio] DATE NOT NULL,
    [tipo] NVARCHAR(10) NOT NULL CONSTRAINT [hojas_ruta_tipo_df] DEFAULT 'SEMANAL',
    [habilitada] BIT NOT NULL CONSTRAINT [hojas_ruta_habilitada_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [hojas_ruta_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [hojas_ruta_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[rutas] (
    [id] NVARCHAR(1000) NOT NULL,
    [frecuencia_id] NVARCHAR(1000) NOT NULL,
    [bus_id] NVARCHAR(1000) NOT NULL,
    [oficinista_id] NVARCHAR(1000) NOT NULL,
    [hoja_ruta_id] NVARCHAR(1000),
    [fecha] DATE NOT NULL,
    [estado] NVARCHAR(20) NOT NULL CONSTRAINT [rutas_estado_df] DEFAULT 'HABILITADA',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [rutas_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [rutas_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [rutas_bus_id_fecha_frecuencia_id_key] UNIQUE NONCLUSTERED ([bus_id],[fecha],[frecuencia_id])
);

-- CreateTable
CREATE TABLE [dbo].[boletos] (
    [id] NVARCHAR(1000) NOT NULL,
    [ruta_id] NVARCHAR(1000) NOT NULL,
    [asiento_id] NVARCHAR(1000) NOT NULL,
    [usuario_id] NVARCHAR(1000),
    [vendido_por_id] NVARCHAR(1000),
    [pasajero_nombre] NVARCHAR(150) NOT NULL,
    [pasajero_cedula] NVARCHAR(13) NOT NULL,
    [tipo_pasajero] NVARCHAR(20) NOT NULL CONSTRAINT [boletos_tipo_pasajero_df] DEFAULT 'NORMAL',
    [precio_base] DECIMAL(10,2) NOT NULL,
    [descuento] DECIMAL(5,2) NOT NULL CONSTRAINT [boletos_descuento_df] DEFAULT 0,
    [precio_final] DECIMAL(10,2) NOT NULL,
    [codigo_qr] NVARCHAR(500),
    [estado] NVARCHAR(20) NOT NULL CONSTRAINT [boletos_estado_df] DEFAULT 'PENDIENTE',
    [comprobante_url] NVARCHAR(500),
    [metodo_pago] NVARCHAR(20) NOT NULL CONSTRAINT [boletos_metodo_pago_df] DEFAULT 'TRANSFERENCIA',
    [canal_venta] NVARCHAR(10) NOT NULL,
    [origen_tramo] NVARCHAR(100) NOT NULL,
    [destino_tramo] NVARCHAR(100) NOT NULL,
    [abordado] BIT NOT NULL CONSTRAINT [boletos_abordado_df] DEFAULT 0,
    [fecha_abordaje] DATETIME2,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [boletos_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [boletos_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [boletos_ruta_id_asiento_id_key] UNIQUE NONCLUSTERED ([ruta_id],[asiento_id])
);

-- CreateTable
CREATE TABLE [dbo].[notificaciones] (
    [id] NVARCHAR(1000) NOT NULL,
    [usuario_id] NVARCHAR(1000) NOT NULL,
    [titulo] NVARCHAR(200) NOT NULL,
    [mensaje] NVARCHAR(1000) NOT NULL,
    [tipo] NVARCHAR(20) NOT NULL CONSTRAINT [notificaciones_tipo_df] DEFAULT 'INFO',
    [leida] BIT NOT NULL CONSTRAINT [notificaciones_leida_df] DEFAULT 0,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [notificaciones_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [notificaciones_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[roles_permisos] ADD CONSTRAINT [roles_permisos_rol_id_fkey] FOREIGN KEY ([rol_id]) REFERENCES [dbo].[roles]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[roles_permisos] ADD CONSTRAINT [roles_permisos_permiso_id_fkey] FOREIGN KEY ([permiso_id]) REFERENCES [dbo].[permisos]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[usuarios] ADD CONSTRAINT [usuarios_rol_id_fkey] FOREIGN KEY ([rol_id]) REFERENCES [dbo].[roles]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[categorias_asiento] ADD CONSTRAINT [categorias_asiento_bus_id_fkey] FOREIGN KEY ([bus_id]) REFERENCES [dbo].[buses]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[asientos] ADD CONSTRAINT [asientos_categoria_id_fkey] FOREIGN KEY ([categoria_id]) REFERENCES [dbo].[categorias_asiento]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[paradas_intermedias] ADD CONSTRAINT [paradas_intermedias_frecuencia_id_fkey] FOREIGN KEY ([frecuencia_id]) REFERENCES [dbo].[frecuencias]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[hojas_ruta] ADD CONSTRAINT [hojas_ruta_oficinista_id_fkey] FOREIGN KEY ([oficinista_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rutas] ADD CONSTRAINT [rutas_frecuencia_id_fkey] FOREIGN KEY ([frecuencia_id]) REFERENCES [dbo].[frecuencias]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rutas] ADD CONSTRAINT [rutas_bus_id_fkey] FOREIGN KEY ([bus_id]) REFERENCES [dbo].[buses]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rutas] ADD CONSTRAINT [rutas_oficinista_id_fkey] FOREIGN KEY ([oficinista_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rutas] ADD CONSTRAINT [rutas_hoja_ruta_id_fkey] FOREIGN KEY ([hoja_ruta_id]) REFERENCES [dbo].[hojas_ruta]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[boletos] ADD CONSTRAINT [boletos_ruta_id_fkey] FOREIGN KEY ([ruta_id]) REFERENCES [dbo].[rutas]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[boletos] ADD CONSTRAINT [boletos_asiento_id_fkey] FOREIGN KEY ([asiento_id]) REFERENCES [dbo].[asientos]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[boletos] ADD CONSTRAINT [boletos_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[boletos] ADD CONSTRAINT [boletos_vendido_por_id_fkey] FOREIGN KEY ([vendido_por_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notificaciones] ADD CONSTRAINT [notificaciones_usuario_id_fkey] FOREIGN KEY ([usuario_id]) REFERENCES [dbo].[usuarios]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
