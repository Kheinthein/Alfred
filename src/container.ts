import { Container } from 'inversify';
import 'reflect-metadata';

// Repositories
import { IAIAnalysisRepository } from '@modules/ai-assistant/domain/repositories/IAIAnalysisRepository';
import { AIAnalysisRepository } from '@modules/ai-assistant/infrastructure/repositories/AIAnalysisRepository';
import { IBookRepository } from '@modules/book/domain/repositories/IBookRepository';
import { BookRepository } from '@modules/book/infrastructure/repositories/BookRepository';
import { IDocumentRepository } from '@modules/document/domain/repositories/IDocumentRepository';
import { IDocumentVersionRepository } from '@modules/document/domain/repositories/IDocumentVersionRepository';
import { DocumentRepository } from '@modules/document/infrastructure/repositories/DocumentRepository';
import { DocumentVersionRepository } from '@modules/document/infrastructure/repositories/DocumentVersionRepository';
import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { UserRepository } from '@modules/user/infrastructure/repositories/UserRepository';

// AI Service
import { IAIServicePort } from '@modules/ai-assistant/domain/repositories/IAIServicePort';
import { AIAdapterFactory } from '@modules/ai-assistant/infrastructure/ai/AIAdapterFactory';

// Use Cases - User
import { AuthenticateUser } from '@modules/user/domain/use-cases/AuthenticateUser';
import { CreateUser } from '@modules/user/domain/use-cases/CreateUser';

// Use Cases - Document
import { CreateDocument } from '@modules/document/domain/use-cases/CreateDocument';
import { DeleteDocument } from '@modules/document/domain/use-cases/DeleteDocument';
import { GetUserDocuments } from '@modules/document/domain/use-cases/GetUserDocuments';
import { MoveDocumentToBook } from '@modules/document/domain/use-cases/MoveDocumentToBook';
import { ReorderDocuments } from '@modules/document/domain/use-cases/ReorderDocuments';
import { UpdateDocument } from '@modules/document/domain/use-cases/UpdateDocument';

// Use Cases - Book
import { CreateBook } from '@modules/book/domain/use-cases/CreateBook';
import { DeleteBook } from '@modules/book/domain/use-cases/DeleteBook';
import { ReorderBooks } from '@modules/book/domain/use-cases/ReorderBooks';
import { UpdateBook } from '@modules/book/domain/use-cases/UpdateBook';

// Use Cases - AI
import { AnalyzeText } from '@modules/ai-assistant/domain/use-cases/AnalyzeText';

// Services
import { UserService } from '@modules/user/application/services/UserService';

// Database
import { prisma } from '@shared/infrastructure/database/prisma';

/**
 * Conteneur d'injection de dépendances avec InversifyJS
 */
const container = new Container();

// Bind Prisma Client
container.bind('PrismaClient').toConstantValue(prisma);

// Bind Repositories
container
  .bind<IUserRepository>('IUserRepository')
  .toDynamicValue(() => new UserRepository(prisma))
  .inSingletonScope();

container
  .bind<IDocumentRepository>('IDocumentRepository')
  .toDynamicValue(() => new DocumentRepository(prisma))
  .inSingletonScope();

container
  .bind<IAIAnalysisRepository>('IAIAnalysisRepository')
  .toDynamicValue(() => new AIAnalysisRepository(prisma))
  .inSingletonScope();

container
  .bind<IDocumentVersionRepository>('IDocumentVersionRepository')
  .toDynamicValue(() => new DocumentVersionRepository(prisma))
  .inSingletonScope();

container
  .bind<IBookRepository>('IBookRepository')
  .toDynamicValue(() => new BookRepository(prisma))
  .inSingletonScope();

// Bind AI Service (créé depuis la factory selon env)
// Lazy loading : créé uniquement quand réellement utilisé
container
  .bind<IAIServicePort>('IAIServicePort')
  .toDynamicValue(() => {
    try {
      console.log('🔧 Création du service IA...');
      console.log('   AI_PROVIDER:', process.env.AI_PROVIDER);
      console.log('   GEMINI_MODEL:', process.env.GEMINI_MODEL);
      console.log('   GEMINI_API_KEY présent:', !!process.env.GEMINI_API_KEY);

      const service = AIAdapterFactory.createFromEnv();
      console.log('✅ Service IA créé avec succès');
      return service;
    } catch (error) {
      console.error('❌ Erreur lors de la création du service IA:');
      console.error(
        '   Message:',
        error instanceof Error ? error.message : String(error)
      );
      console.error(
        '   Stack:',
        error instanceof Error ? error.stack : undefined
      );
      console.error('💡 Vérifiez que :');
      console.error('   - npm install a été exécuté');
      console.error('   - AI_PROVIDER est défini dans .env');
      console.error('   - La clé API correspondante est définie');
      throw error;
    }
  })
  .inSingletonScope();

// Bind Use Cases - User
container
  .bind<CreateUser>(CreateUser)
  .toDynamicValue((context) => {
    const userRepo = context.container.get<IUserRepository>('IUserRepository');
    return new CreateUser(userRepo);
  })
  .inTransientScope();

container
  .bind<AuthenticateUser>(AuthenticateUser)
  .toDynamicValue((context) => {
    const userRepo = context.container.get<IUserRepository>('IUserRepository');
    return new AuthenticateUser(userRepo);
  })
  .inTransientScope();

// Bind Use Cases - Document
container
  .bind<CreateDocument>(CreateDocument)
  .toDynamicValue((context) => {
    const docRepo = context.container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    return new CreateDocument(docRepo);
  })
  .inTransientScope();

container
  .bind<UpdateDocument>(UpdateDocument)
  .toDynamicValue((context) => {
    const docRepo = context.container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    const versionRepo = context.container.get<IDocumentVersionRepository>(
      'IDocumentVersionRepository'
    );
    return new UpdateDocument(docRepo, versionRepo);
  })
  .inTransientScope();

container
  .bind<DeleteDocument>(DeleteDocument)
  .toDynamicValue((context) => {
    const docRepo = context.container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    return new DeleteDocument(docRepo);
  })
  .inTransientScope();

container
  .bind<GetUserDocuments>(GetUserDocuments)
  .toDynamicValue((context) => {
    const docRepo = context.container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    return new GetUserDocuments(docRepo);
  })
  .inTransientScope();

container
  .bind<ReorderDocuments>(ReorderDocuments)
  .toDynamicValue((context) => {
    const docRepo = context.container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    return new ReorderDocuments(docRepo);
  })
  .inTransientScope();

container
  .bind<MoveDocumentToBook>(MoveDocumentToBook)
  .toDynamicValue((context) => {
    const docRepo = context.container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    const bookRepo = context.container.get<IBookRepository>('IBookRepository');
    return new MoveDocumentToBook(docRepo, bookRepo);
  })
  .inTransientScope();

// Bind Use Cases - Book
container
  .bind<CreateBook>(CreateBook)
  .toDynamicValue((context) => {
    const bookRepo = context.container.get<IBookRepository>('IBookRepository');
    return new CreateBook(bookRepo);
  })
  .inTransientScope();

container
  .bind<UpdateBook>(UpdateBook)
  .toDynamicValue((context) => {
    const bookRepo = context.container.get<IBookRepository>('IBookRepository');
    return new UpdateBook(bookRepo);
  })
  .inTransientScope();

container
  .bind<DeleteBook>(DeleteBook)
  .toDynamicValue((context) => {
    const bookRepo = context.container.get<IBookRepository>('IBookRepository');
    return new DeleteBook(bookRepo);
  })
  .inTransientScope();

container
  .bind<ReorderBooks>(ReorderBooks)
  .toDynamicValue((context) => {
    const bookRepo = context.container.get<IBookRepository>('IBookRepository');
    return new ReorderBooks(bookRepo);
  })
  .inTransientScope();

// Bind Use Cases - AI
container
  .bind<AnalyzeText>(AnalyzeText)
  .toDynamicValue((context) => {
    const docRepo = context.container.get<IDocumentRepository>(
      'IDocumentRepository'
    );
    const aiService = context.container.get<IAIServicePort>('IAIServicePort');
    const aiAnalysisRepo = context.container.get<IAIAnalysisRepository>(
      'IAIAnalysisRepository'
    );
    return new AnalyzeText(docRepo, aiService, aiAnalysisRepo);
  })
  .inTransientScope();

// Bind Services
container
  .bind<UserService>(UserService)
  .toDynamicValue((context) => {
    const createUser = context.container.get<CreateUser>(CreateUser);
    const authenticateUser =
      context.container.get<AuthenticateUser>(AuthenticateUser);
    return new UserService(createUser, authenticateUser);
  })
  .inSingletonScope();

export { container };
